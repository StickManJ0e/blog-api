const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');
require("dotenv").config();
const Post = require('../models/post');
const Comment = require('../models/comment');

// Handle fetch all blog posts on GET
exports.get_blog_posts = asyncHandler(async (req, res, next) => {
    const allBlogPosts = await Post.find({}).sort({ timestamp: -1 }).populate('user').exec();
    return res.status(200).json({
        allBlogPosts
    })
})

// Handle fetching details for a specific post on GET
exports.get_blog_post = asyncHandler(async (req, res, next) => {
    const [post] = await Promise.all([
        Post
            .findById(req.params.id)
            .populate("comments")
            .populate('user')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user'
                }
            }).exec(),
    ]);

    if (post === null) {
        // No results
        return res.status(404).json({ message: 'Post not found' });
    } else {
        return res.status(200).json({ post });
    }
})

// Handle fetching details for blog posts by a certain user on GET
exports.get_user_blog_posts = asyncHandler(async (req, res, next) => {
    const allBlogPosts = await Post.find({'user': req.headers['user._id']}).sort({ timestamp: -1 }).populate('user').exec();
    return res.status(200).json({
        allBlogPosts
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
                user: req.headers['user._id'],
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
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
        if (err) { res.sendStatus(403); }
        else {
            // Get details of the post and all comments (in parallel)
            const [allCommentsInPost] = await Promise.all([
                Comment.find({ post: req.headers['id'] }).exec(),
            ]);

            if (allCommentsInPost.length > 0) {
                allCommentsInPost.forEach(async (comment) => {
                    await Comment.findByIdAndDelete((comment._id.toString()));
                });
            };

            await Post.findByIdAndDelete(req.headers['id']);
            return res.status(200).json({
                message: `Post with id ${req.headers['id']} deleted successfully,`
            });
        }
    })
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
