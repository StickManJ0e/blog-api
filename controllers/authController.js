const User = require('../models/user');
const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

// Authentication
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Test API Connection
exports.index = asyncHandler(async (req, res, next) => {
    res.json({
        message: 'Welcome to the API',
    });
});

// Handle sign up for User on POST
exports.sign_up = [
    // Validate and sanitize fields
    body('username')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Username must not be empty')
        .custom(async (username) => {
            try {
                const usernameExists = await User.findOne({ username: username });
                if (usernameExists) {
                    throw new Error('Username already exists');
                }
            } catch (err) {
                throw new Error(err);
            };
        })
        .escape(),
    body('email')
        .trim()
        .isLength({ min: 1 })
        .withMessage("Email must not be empty")
        .custom(async (email) => {
            try {
                const emailExists = await User.findOne({ email: email });
                if (emailExists) {
                    throw new Error('Email is already used');
                }
            } catch (err) {
                throw new Error(err);
            };
        })
        .escape(),
    body('password')
        .trim()
        .isLength({ min: 1 })
        .withMessage("Password must not be empty")
        .escape(),
    body("password_confirmation", "Passwords do not match")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match')
            }
            return true;
        }),
    // Process request after validation and sanitization

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(403).json({
                username: req.body.username,
                errors: errors.array()
            });
        } else {
            // Encrypt password
            bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
                if (err) {
                    return next(err);
                } else {
                    // Create a User object with escaped and trimmed data
                    const user = new User({
                        username: req.body.username,
                        email: req.body.email,
                        password: hashedPassword,
                    });

                    // Data from form is valid. Save user.
                    await user.save();
                    res.status(200).json({
                        message: 'User created sucessfully',
                    })
                }
            })
        }
    })
]

// Handle sign in for User on POST and return session token
exports.sign_in = asyncHandler(async (req, res, next) => {
    passport.authenticate("local", function (err, user, info) {
        if (err || !user) {
            const error = new Error("User does not exist");
            return res.status(403).json({
                info
            });
        };

        req.logIn(user, function (err) {
            if (err) { return next(err) }
            const body = { _id: user._id, username: user.username, admin: user.admin }
            const token = jwt.sign({ user: body }, process.env.SECRET_KEY, { expiresIn: '1d' })

            return res.status(200).json({ body, token })
        })
    })(req, res, next)
});

// Handle log out User on GET
exports.log_out = asyncHandler(async (req, res, next) => {
    req.logout((err)=> {
        if (err) {return next (err)};
    });
    return res.status(200).json({message: "Logged out"});
});

// Verify Token Function
exports.verifyToken = asyncHandler(async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    //Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[0];
        req.token = bearerToken;
        next();
    } else {
        // Send Forbidden error
        res.sendStatus(403);
    };
});