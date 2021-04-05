var dbConfig = require('../util/dbconfig')
var fs = require('fs');
const { title } = require('process');

let uploadMoreImg = (req, res) => {
    console.log('------------------------')
    if (req.files.length === 0) {
        res.render('error', { message: '上传文件不能为空！' });
    } else {
        let sql = `insert into image (url,user_id,post_id) values `;
        let sqlArr = [];
        for (var i in req.files) {
            res.set({
                'content-type': 'application/json; charset=utf8'
            });
            let file = req.files[i];
            fs.renameSync('./public/uploads/' + file.filename, './public/uploads/' + file.originalname);
            let { user_id, post_id } = req.query;
            let url = 'http://localhost:3000/uploads/' + file.originalname;
            if (req.files.length - 1 == i) {
                sql += '(?)'
            } else {
                sql += '(?),'
            }
            console.log(sql);
            sqlArr.push([url, user_id, post_id])
        }
        //批量存储到数据库
        dbConfig.sqlConnect(sql, sqlArr, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                console.log(data.affectedRows);
                if (data.affectedRows > 0) {
                    res.send({
                        code: 200,
                        affectedRows: data.affectedRows,
                        msg: '上传成功'
                    });
                } else {
                    res.send({
                        code: 400,
                        msg: '上传失败'
                    });
                }
            }
        })
    }
}

const publish = async (req, res) => {
    let { user_id, title, pic, details } = req.body;
    console.log(req.body)
    let sql = 'insert into post (user_id,title,pic,details) values (?,?,?,?)';
    let sqlArr = [user_id, title, pic, details];
    let post_id = await dbConfig.SySqlConnect(sql, sqlArr).then(res => {
        console.log(res);
        return res.insertId;
    }).catch(err => {
        return false;
    })
    if (post_id) {
        res.send({
            code: 200,
            msg: '发布成功'
        })
    } else {
        res.send({
            code: 400,
            msg: '发布失败'
        })
    }
}
var dbConfig = require('../util/dbconfig');

//检查用户是否关注
const checkFollow = async (user_id, follow_id, follow_type) => {
    let sql = `select * from follow where user_id=? and follow_id=? and follow_type=?`;
    let sqlArr = [user_id, follow_id, follow_type];
    let result = await dbConfig.SySqlConnect(sql, sqlArr);
    console.log(result.length && result.length > 0)
    if (result.length && result.length > 0) {
        return true;
    } else {
        return false;
    }
}
//关注
const follow = async (req, res) => {
    let { user_id, follow_id, follow_type } = req.query;
    //检查是否之前关注过
    if (! await checkFollow(user_id, follow_id, follow_type)) {
        if (user_id == follow_id) {
            res.send({
                code: 400,
                msg: '亲，不能关注自己'
            })
        } else {
            let sql = `insert into follow (follow_id,user_id,follow_type) values (?,?,?)`;
            let sqlArr = [follow_id, user_id, follow_type];
            let result = await dbConfig.SySqlConnect(sql, sqlArr);
            if (result.affectedRows == 1) {
                res.send({
                    code: 200,
                    msg: '亲，关注成功！'
                })
            } else {
                res.send({
                    code: 400,
                    msg: '亲，关注失败！'
                })
            }
        }
    } else {
        res.send({
            code: 400,
            msg: '亲，不能重复关注'
        })
    }


}
//取消关注
const unfollow = async (req, res) => {
    let { user_id, follow_id, follow_type } = req.query;
    //检查是否之前关注过
    console.log(checkFollow(user_id, follow_id, follow_type));
    if (await checkFollow(user_id, follow_id, follow_type)) {
        if (user_id == follow_id) {
            res.send({
                code: 400,
                msg: '亲，不能关注自己'
            })
        } else {
            let sql = `delete from follow where follow_id=? and user_id=? and follow_type=?`;
            let sqlArr = [follow_id, user_id, follow_type];
            let result = await dbConfig.SySqlConnect(sql, sqlArr);
            if (result.affectedRows == 1) {
                res.send({
                    code: 200,
                    msg: '亲，取关成功！'
                })
            } else {
                res.send({
                    code: 400,
                    msg: '亲，取关失败！'
                })
            }
        }
    } else {
        res.send({
            code: 400,
            msg: '亲，还没有关注哦'
        })
    }


}
module.exports = {
    uploadMoreImg,
    publish,
    follow,
    unfollow
}