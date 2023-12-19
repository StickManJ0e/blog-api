var express = require('express');
var router = express.Router();
const auth_controller = require('../controllers/authController');
const post_controller = require('../controllers/postController')

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
router.get('/posts/:id', auth_controller.verifyToken, post_controller.get_blod_post);

// DELETE request for deleting a blog post
router.delete('/posts/:id', post_controller.delete_blog_post);

// PUT request for updating a blog post
router.put('/posts/:id', auth_controller.verifyToken, post_controller.update_blog_post);


module.exports = router;
