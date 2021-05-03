var dbConfig = require('../util/dbconfig')
var fs = require('fs');
const { syncDependent } = require('./xfyun');

let uploadMoreImg = (req, res) => {
    if (req.file.length === 0) {
        res.render('error', { message: '上传文件不能为空！' });
        return;
    }
    let file = req.file;
    console.log(file);
    fs.renameSync('./public/uploads/' + file.filename, './public/uploads/' + file.originalname);
    res.set({
        'content-type': 'application/JSON; charset=utf-8'
    })

    let imgUrl = 'http://localhost:3000/public/uploads/' + file.originalname;
    let sql = `INSERT INTO image (url) VALUES(?)`;
    let sqlArr = [imgUrl];
    dbConfig.sqlConnect(sql, sqlArr, (err, data) => {
        if (err) {
            console.log(err);
            throw '出错了';
        } else {
            if (data.affectedRows == 1) {
                res.send({
                    code: 200,
                    msg: '上传成功',
                    data: imgUrl
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
const saveKeyword = async (text, userId, postId) => {
    let keyWords = await syncDependent(text)
    console.log(keyWords)
    let sql = 'insert ignore into keyword (keyword) values (?)'
    let freshSql = 'update keyword set hot = hot + 1 where keyword=?'
    keyWords.map(async (item) => {
        if (Number(item.score) > 0.55) {
            let userResult = await dbConfig.SySqlConnect('insert ignore into post_keyword (keyword , user_id , post_id) values (?,?,?)', [item.word, userId, postId])
            var sqlArr = [item.word]
            let result = await dbConfig.SySqlConnect(sql, sqlArr).then(res => {
                return res.insertId;
            }).catch(err => {
                return false;
            })
            if (result === 0) {
                let res = await dbConfig.SySqlConnect(freshSql, [item.word])
            }
            if (userResult === 0) {
                let res = await dbConfig.SySqlConnect('update post_keyword set hot = hot + 1 where keyword=? and userid=?', [item.word, userId])
            }
        }

    })
};
const publish = async (req, res) => {
    let { user_id, title, pic, details } = req.body;
    const text = title + details;
    // let keyWords = await syncDependent(text)
    // console.log(keyWords)
    let sql = 'insert into post (user_id,title,pic,details) values (?,?,?,?)';
    let sqlArr = [user_id, title, pic, details];
    let post_id = await dbConfig.SySqlConnect(sql, sqlArr).then(res => {
        return res.insertId;
    }).catch(err => {
        return false;
    })
    if (post_id) {
        saveKeyword(text, user_id, post_id)
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

//关键词推荐
const pushKeyWord = async (req,res) => {
    const num = req.query.num || 6
    let sql = ` select * from keyword order by hot desc`
    let sqlArr = [];
    let result = await dbConfig.SySqlConnect(sql, sqlArr);
    if (result) {
        res.send({
            data: result.slice(0,num)
        })
    } else {
        res.send({
            data: 'errpr'
        })
    }
}


module.exports = {
    uploadMoreImg,
    publish,
    follow,
    unfollow,
    pushKeyWord
}