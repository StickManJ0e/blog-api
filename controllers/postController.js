const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');
require("dotenv").config();
const Post = require('../models/post');

const app = express();

// Handle fetch all blog posts on GET
exports.get_blog_posts = asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
        if (err) { res.sendStatus(403); }
        else {
            const allBlogPosts = await Post.find({}).sort({ timestamp: -1 }).populate('user').exec();
            return res.status(200).json({
                allBlogPosts
            })
        }
    })
})

// Handle fetching details for a specific post on GET
exports.get_blod_post = asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
        if (err) { res.sendStatus(403); }
        else {
            const [post] = await Promise.all([
                Post.findById(req.params.id).populate("comments").exec(),
            ]);

            if (post === null) {
                // No results
                return res.status(404).json({ message: 'Post not found' });
            } else {
                return res.status(200).json({ post });
            }
        }
    })
})

// Handle create blog post for User on POST
exports.create_blog_post = [
    // Validate and sanitize fields
    body('title')
        .trim()
        .isLength({ min: 1 })
        .withMessage("No title provided")
        .escape(),
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
                username: req.body.username,
                errors: errors.array()
            })
        } else {
            const post = new Post({
                title: req.body.title,
                content: req.body.content,
                user: req.user._id,
            })
            // Verify token
            jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
                if (err) { res.sendStatus(403); }
                else {
                    await post.save();
                    return res.status(200).json({
                        post,
                        authData
                    });
                }
            })
        }
    })
]

// Handle deleting blog posts on DELETE
exports.delete_blog_post = asyncHandler(async (req, res, next) => {
    await Post.findByIdAndDelete(req.body.postid);
    return res.status(200).json({
        message: `Post with if ${req.body.postid} deleted successfully,`
    });
});

// Handle blog post editing on PUT
exports.update_blog_post = [
    // Validate and sanitize fields
    body('title')
        .trim()
        .isLength({ min: 1 })
        .withMessage("No title provided")
        .escape(),
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
                const post = {
                    title: req.body.title,
                    content: req.body.content,
                }
                const updatedPost = await Post.findByIdAndUpdate(req.params.id, post, {})
                return res.status(200).json({
                    updatedPost
                });
            })
        }
    })
]
