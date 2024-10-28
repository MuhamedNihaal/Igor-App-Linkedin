import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:5000',  // Your backend URL
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add interceptor to include auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const CommentsTable = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/api/linkedin/comments/${postId}`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError('Failed to fetch comments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (commentId) => {
        try {
            setError(null);
            await api.post(`/api/linkedin/comments/${postId}/reply`, {
                commentId,
                message: replyText
            });
            setReplyText('');
            setSelectedCommentId(null);
            fetchComments(); // Refresh comments after reply
        } catch (error) {
            console.error('Error posting reply:', error);
            setError('Failed to post reply. Please try again.');
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading comments...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-4">{error}</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="px-4 py-2 bg-gray-50">Author</th>
                        <th className="px-4 py-2 bg-gray-50">Comment</th>
                        <th className="px-4 py-2 bg-gray-50">Timestamp</th>
                        <th className="px-4 py-2 bg-gray-50">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {comments.map((comment) => (
                        <React.Fragment key={comment._id || comment.id}>
                            <tr>
                                <td className="px-4 py-2 border-b">
                                    {comment.authorName}
                                    <br />
                                    <span className="text-sm text-gray-500">ID: {comment.authorId}</span>
                                </td>
                                <td className="px-4 py-2 border-b">{comment.commentText || comment.text}</td>
                                <td className="px-4 py-2 border-b">
                                    {new Date(comment.timestamp).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    <button
                                        onClick={() => setSelectedCommentId(comment._id || comment.id)}
                                        className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                                    >
                                        Reply
                                    </button>
                                </td>
                            </tr>
                            {selectedCommentId === (comment._id || comment.id) && (
                                <tr>
                                    <td colSpan="4" className="px-4 py-2 border-b">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Type your reply..."
                                                className="flex-1 px-3 py-2 border rounded"
                                            />
                                            <button
                                                onClick={() => handleReply(comment._id || comment.id)}
                                                className="px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CommentsTable;