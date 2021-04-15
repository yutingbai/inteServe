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
router.post('/searchPost',async(req, res)=> {
  var sql = `SELECT * FROM student WHERE CONCAT(title,detail) LIKE %${req.data}%`;
    var sqlArr = [];
    let result =await dbConfig.SySqlConnect(sql, sqlArr)
    if (result.length) {
        res.send({
            msg: '相关信息',
            status: 0,
            data: result
            
        });
    }
    else {
        res.send({
            msg: '获取信息失败',
            status: -1
        });
    }
})
module.exports = router;
