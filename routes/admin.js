var express = require('express');
var router = express.Router();
var adminControllers = require('../controllers/admin')
/* GET home page. */
router.get('/Userslist', adminControllers.usersList);
router.post('/DeleteUser' , adminControllers.deleteUser)
module.exports = router;
