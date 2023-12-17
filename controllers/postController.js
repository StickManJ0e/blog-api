const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
require("dotenv").config();

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