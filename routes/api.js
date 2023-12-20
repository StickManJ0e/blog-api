var express = require('express');
var router = express.Router();
const auth_controller = require('../controllers/authController');
const post_controller = require('../controllers/postController');
const comment_controller = require('../controllers/commentsController');

/* GET home page. */
router.get('/', auth_controller.index);

/// AUTH Routes ///

// POST request for User sign-up
router.post('/sign-up', auth_controller.sign_up);

// POST request for User sign-in
router.post('/sign-in', auth_controller.sign_in);

//GET request for User log out
router.get('/log-out', auth_controller.log_out);

/// POST Routers ///

// GET request for fetch all blog post data
router.get('/posts', auth_controller.verifyToken, post_controller.get_blog_posts);

// POST request for create blog post
router.post('/posts', auth_controller.verifyToken, post_controller.create_blog_post);

// GET request for fetching a specific blog posyt
router.get('/posts/:id', auth_controller.verifyToken, post_controller.get_blog_post);

// DELETE request for deleting a blog post
router.delete('/posts/:id', auth_controller.verifyToken, post_controller.delete_blog_post);

// PUT request for updating a blog post
router.put('/posts/:id', auth_controller.verifyToken, post_controller.update_blog_post);

// COMMENT Router //

// GET request to fetch all comments for a specific post
router.get('/posts/:postid/comments', auth_controller.verifyToken, comment_controller.get_blog_comments);

// POST request to create a comment
router.post('/posts/:postid/comments', auth_controller.verifyToken, comment_controller.create_comment);

// DELETE request for deleting a comment
router.delete('/posts/:postid/comments/:id', auth_controller.verifyToken, comment_controller.delete_comment);

// PUT request for editing a comment
router.put('/posts/:id/comments/:id', auth_controller.verifyToken, comment_controller.update_comment);

module.exports = router;