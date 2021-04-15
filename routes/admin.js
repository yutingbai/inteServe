var express = require('express');
var router = express.Router();
var adminControllers = require('../controllers/admin')
/* GET home page. */
router.get('/Userslist', adminControllers.usersList);
router.post('/DeleteUser' , adminControllers.deleteUser)
router.get('/Postslist', adminControllers.postList);
router.post('/Deletepost' , adminControllers.deletePost)
module.exports = router;
