const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');
require("dotenv").config();
const Post = require('../models/post');
const Comment = require('../models/comment');

// Handle fetching comments for User on GET
exports.get_blog_comments = asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
        if (err) { res.sendStatus(403); }
        else {
            const allComments = await Comment.find({ post: req.params.postid }).sort({ timestamp: -1 }).populate('user').exec();
            return res.status(200).json({
                allComments,
                authData
            })
        }
    })
})

// Handle create comment for User on POST
exports.create_comment = [
    // Validate and sanitize fields
    body("content")
        .trim()
        .isLength({ min: 1 })
        .withMessage("No content provided")
        .escape(),
    // Process request after validation and sanitization 

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(403).json({
                errors: errors.array()
            })
        } else {
            //Verify token
            jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
                if (err) { res.sendStatus(403); }
                else {
                    const comment = new Comment({
                        content: req.body.content,
                        user: req.user._id,
                        post: req.params.postid,
                    });
                    await comment.save();
                    await Post.findOneAndUpdate(
                        { _id: req.params.postid },
                        { $push: { comments: comment } }
                    );
                    return res.status(200).json({
                        comment,
                        authData
                    });
                };
            });
        };
    })
];

// Handle deleting comments for User on DELETE
exports.delete_comment = asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
        if (err) { res.sendStatus(403); }
        else {
            // Delete post reference to comment
            await Post.findOneAndUpdate(
                { _id: req.params.postid },
                { $pull: { comments: req.params.id } }
            );
            // Delete Comment with param id
            await Comment.findByIdAndDelete(req.params.id);
            return res.status(200).json({
                message: `Comment with id ${req.params.id} deleted successfully,`
            });
        }
    })
})

// Handle editing comments for User on PUT
exports.update_comment = [
    // Validate and sanitize fields
    body("content")
        .trim()
        .isLength({ min: 1 })
        .withMessage("No content provided")
        .escape(),
    // Process request after validation and sanitization 

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(403).json({
                errors: errors.array()
            })
        } else {
            jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
                if (err) { res.sendStatus(403); }
                const comment = {
                    content: req.body.content,
                }
                const updatedComment = await Comment.findByIdAndUpdate(req.params.id, comment, {})
                return res.status(200).json({
                    updatedComment
                });
            })
        }
    })
]