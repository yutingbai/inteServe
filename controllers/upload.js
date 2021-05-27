var dbConfig = require('../util/dbconfig')
let fs = require('fs');
var iconv = require('iconv-lite');

const uploadsStore = async (req, res) => {
    let { file_type, file_name, file } = req.body;
    let filetypeId = ''
    let fileIdresult =await dbConfig.SySqlConnect(`select id from storetype where id ='${file_type}' or type_name = '${file_type}'`)
    console.log(fileIdresult)
    if(fileIdresult.length===0){
        let result =await dbConfig.SySqlConnect(`INSERT INTO storetype (type_name, user_id) VALUES ('${file_type}', 13)`)
        filetypeId = result.insertid
    }else{
        filetypeId = fileIdresult[0].id
    }
    console.log(filetypeId , file , file_name)
    let sql = `INSERT INTO filestore (file_type, file_path, file_name) VALUES (?, ?, ?)`;
    let sqlArr = [filetypeId, file, file_name];
    dbConfig.sqlConnect(sql, sqlArr, (err, data) => {
        if (err) {
            res.send({
                code: 400,
                msg: '上传失败',
            })
        } else {
            if (data.affectedRows == 1) {
                res.send({
                    code: 200,
                    msg: '上传成功',
                })
            } else {
                res.send({
                    code: 400,
                    msg: '上传失败'
                })
            }
        }
    })
}
const uploadsFile = (req, res) => {
    if (req.file.length === 0) {
        res.render('error', { message: '上传文件不能为空！' });
        return;
    }
    let file = req.file;
    let newname = file.originalname;
    fs.renameSync('./public/uploads/' + file.filename, './public/uploads/' + newname);
    res.set({
        'content-type': 'application/JSON; charset=utf-8'
    })

    let filePath = 'http://localhost:3000/public/uploads/' + newname;

    res.send({
        code: 200,
        url: filePath
    })
}
const getfileType = async (req, res) => {
    let sql = ` select * from storetype`
    let sqlArr = [];
    let result = await dbConfig.SySqlConnect(sql, sqlArr).catch((err) => {
        res.send({
            status: -1,
            data: err
        })
    });
    for (var i in result) {
        result[i].stores = await dbConfig.SySqlConnect(`select file_path , file_name ,create_time from filestore where file_type = ${result[i].id} `, sqlArr)
    }
    res.send({
        status: 200,
        data: result
    })
}

const getAllFile = async (req, res) => {
    let sql = ` SELECT
                    a.*,
                    b.file_path ,
                    b.file_name ,
                    b.create_time ,
                    b.id as file_id
                FROM
                    storetype AS a
                    left JOIN filestore AS b ON a.id = b.file_type`
    let sqlArr = [];
    let result = await dbConfig.SySqlConnect(sql, sqlArr).catch((err) => {
        res.send({
            status: -1,
            data: err
        })
    });
    res.send({
        status: 200,
        data: result
    })
}

const deleteFile = async (req, res) => {
    let { id } = req.query;
    let sql = `delete from filestore where id=?`;
    let sqlArr = [id];
    let result = await dbConfig.SySqlConnect(sql, sqlArr);
    if (result.affectedRows == 1) {
        res.send({
            code: 200,
            msg: '删除成功！'
        })
    } else {
        res.send({
            code: 400,
            msg: '删除失败！'
        })
    }
}
module.exports = {
    uploadsFile,
    getfileType,
    getAllFile,
    deleteFile,
    uploadsStore
};