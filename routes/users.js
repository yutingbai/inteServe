
let multer = require('multer')
var express = require('express');
var router = express.Router();
var userController = require('../controllers/user')
var indexController = require('../controllers/index')
var uploadController = require('../controllers/upload')

let uplode = multer({ dest: './public/uploads/' }).single('file')
let moreUplode = multer({ dest: './public/uploads/' }).array('file', 5)
/* GET users listing. */
router.get('/Verify', userController.verify);
router.post('/Signup', userController.signup);
router.post('/Login', userController.login);
router.post('/Logout', userController.logout)

router.post('/editImg', uplode, userController.editImg)
router.post('/editMoreImg', uplode, indexController.uploadMoreImg)
router.post('/uplodeFile', uplode, uploadController.uploadsFile)
router.get('/getfileType',uploadController.getfileType)
router.get('/getAllFile' , uploadController.getAllFile)
router.post('/publish', indexController.publish)
router.get('/deleteFile',uploadController.deleteFile)
router.post('/uploadsStore',uploadController.uploadsStore)


router.get('/follow', indexController.follow);
router.get('/unfollow', indexController.unfollow);

router.get('/star', indexController.star);
router.get('/like', indexController.like);

router.get('/keyword',indexController.pushKeyWord)
router.get('/postTitle',indexController.pushPostTitle)

router.get('/userInfo',userController.userInfo)

router.get('/postDetail',indexController.postDetail)

router.post('/pushAnswer' , indexController.pushAnswer)
router.post('/pushAnsTalk' , indexController.pushAnsTalk)

router.post('/deleAnswer' , indexController.deleAnswer)
router.post('/deleAnsTalk' , indexController.deleAnsTalk)

router.post('/answerList' , indexController.answerList)
router.post('/ansTalkList' , indexController.ansTalkList)

router.get('/followList' , indexController.followList)

module.exports = router;
