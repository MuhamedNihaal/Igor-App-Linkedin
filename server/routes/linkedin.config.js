const express = require('express');
const router = express.Router();
const axios = require('axios');
const Comment = require('../models/Comment');

// Test endpoint to verify server is running
router.get('/test', (req, res) => {
    res.json({ message: 'LinkedIn integration endpoint is working' });
});

// LinkedIn OAuth initialization
router.get('/auth', (req, res) => {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code&` +
        `client_id=${linkedinConfig.clientId}&` +
        `redirect_uri=${linkedinConfig.redirectUri}&` +
        `scope=${linkedinConfig.scope.join(' ')}`;

    res.redirect(authUrl);
});

// Callback endpoint that LinkedIn will redirect to
router.get('/callback', async (req, res) => {
    const { code } = req.query;

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                client_id: linkedinConfig.clientId,
                client_secret: linkedinConfig.clientSecret,
                redirect_uri: linkedinConfig.redirectUri
            }
        });

        // Store token securely - in development, we'll store in memory
        // In production, you should use proper session management or token storage
        global.linkedinAccessToken = tokenResponse.data.access_token;

        res.redirect('/dashboard'); // Redirect to your dashboard
    } catch (error) {
        console.error('LinkedIn auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Fetch comments from a specific post
router.get('/comments/:postId', async (req, res) => {
    const { postId } = req.params;

    if (!global.linkedinAccessToken) {
        return res.status(401).json({ error: 'Not authenticated with LinkedIn' });
    }

    try {
        // Fetch comments from LinkedIn
        const response = await axios.get(
            `https://api.linkedin.com/v2/socialActions/${postId}/comments`,
            {
                headers: {
                    'Authorization': `Bearer ${global.linkedinAccessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            }
        );

        // Process and store comments in MongoDB
        const comments = await Promise.all(response.data.elements.map(async (comment) => {
            const newComment = new Comment({
                linkedinCommentId: comment.id,
                postId: postId,
                authorName: `${comment.actor.firstName} ${comment.actor.lastName}`,
                authorId: comment.actor.id,
                commentText: comment.message.text,
                timestamp: new Date(comment.created.time)
            });

            await newComment.save();
            return newComment;
        }));

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

module.exports = router;