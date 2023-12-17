var express = require('express');
var router = express.Router();
const auth_controller = require('../controllers/authController');
const post_controller = require('../controllers/postController')

/* GET home page. */
router.get('/', auth_controller.index);

/// AUTH Routes ///

// Post request for User sign-up
router.post('/sign-up', auth_controller.sign_up);

// POST request for User sign-in
router.post('/sign-in', auth_controller.sign_in);

/// POST Routers ///

// POST request for User login
router.post('/post', auth_controller.verifyToken, post_controller.post);


module.exports = router;
