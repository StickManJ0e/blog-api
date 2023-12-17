const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
require("dotenv").config();

const app = express();

// Test API Connection
exports.index = asyncHandler(async (req, res, next) => {
    res.json({
        message: 'Welcome to the API',
    });
});

// POST request for user sign in
exports.login = asyncHandler(async (req, res, next) => {
    // Mock user
    const user = {
        id: 1,
        username: 'brad',
        email: 'brad@gmail',
    }

    jwt.sign({ user }, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
        res.json({
            token
        });
    });
});

// Verify Token
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