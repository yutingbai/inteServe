var express = require('express');
var router = express.Router();
var usersController = require('../controllers/users')
var userController = require('../controllers/user')
/* GET users listing. */
router.get('/Verify', userController.verify);
router.post('/Signup',userController.signup);
router.post('/Login',userController.login);
router.post('Logout',userController.logout)
module.exports = router;
