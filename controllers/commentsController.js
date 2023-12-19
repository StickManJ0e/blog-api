const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');
require("dotenv").config();
const Post = require('../models/post');
const Comment = require('../models/comment');

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
                }
            })
        }
    })
]