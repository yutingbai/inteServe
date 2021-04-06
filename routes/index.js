var express = require('express');
let multer = require('multer')
var router = express.Router();
var xfyunControllers = require('../controllers/xfyun')
var trans = require('../controllers/trans')

let uplode = multer({ dest: './public/uploads/' }).single('file')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/dependent',xfyunControllers.dependent)
router.post('/transcription', uplode, trans.transcription)
module.exports = router;
