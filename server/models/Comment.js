const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    linkedinCommentId: String,
    postId: String,
    authorName: String,
    authorId: String,
    commentText: String,
    timestamp: Date,
    profilePictureUrl: String
});

const Comment = mongoose.model('Comment', commentSchema);