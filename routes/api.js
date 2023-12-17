var express = require('express');
var router = express.Router();
const auth_controller = require('../controllers/authController');

/* GET home page. */
router.get('/', auth_controller.index);

// POST request for User login
router.post('/post', auth_controller.verifyToken, auth_controller.post);

// POST request for User login
router.post('/login', auth_controller.login);


module.exports = router;
