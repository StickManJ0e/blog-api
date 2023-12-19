const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');
require("dotenv").config();
const Post = require('../models/post');

const app = express();

// POST request for posts 
exports.post = async (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                message: 'Post created...',
                authData
            });
        }
    })
};

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