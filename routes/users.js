
let multer = require('multer')
var express = require('express');
var router = express.Router();
var userController = require('../controllers/user')
var indexController = require('../controllers/index')

let uplode = multer({ dest: './public/uploads/' }).single('file')
let moreUplode = multer({ dest: './public/uploads/' }).array('file', 5)
/* GET users listing. */
router.get('/Verify', userController.verify);
router.post('/Signup', userController.signup);
router.post('/Login', userController.login);
router.post('/Logout', userController.logout)

router.post('/editImg', uplode, userController.editImg)
router.post('/editMoreImg', moreUplode, indexController.uploadMoreImg)
router.post('/publish', indexController.publish)

router.get('/follow', indexController.follow);
router.get('/unfollow', indexController.unfollow);
module.exports = router;
