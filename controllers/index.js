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
    let sql = 'insert ignore into keyword (value) values (?)'
    let freshSql = 'update keyword set hot = hot + 1 where value=?'
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
const checkFollow = async (user_id, follow_id) => {
    let sql = `select * from isfollow where user_id=? and follow_id=?`;
    let sqlArr = [user_id, follow_id];
    let result = await dbConfig.SySqlConnect(sql, sqlArr);
    console.log(result)
    if (result.length && result.length > 0) {
        console.log('true')
        return true;
    } else {
        console.log('false')
        return false;
    }
}
//关注
const follow = async (req, res) => {
    let { user_id, follow_id } = req.query;
    console.log(follow_id, user_id)
    //检查是否之前关注过
    if (! await checkFollow(user_id, follow_id)) {
        if (user_id == follow_id) {
            res.send({
                code: 400,
                msg: '亲，不能关注自己'
            })
        } else {
            let sql = `insert into isfollow (follow_id,user_id) values (?,?)`;
            let sqlArr = [follow_id, user_id];
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
    let { user_id, follow_id } = req.query;
    //检查是否之前关注过
    console.log(checkFollow(user_id, follow_id));
    if (await checkFollow(user_id, follow_id)) {
        if (user_id == follow_id) {
            res.send({
                code: 400,
                msg: '亲，不能关注自己'
            })
        } else {
            let sql = `delete from isfollow where follow_id=? and user_id=?`;
            let sqlArr = [follow_id, user_id];
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

//收藏&取消收藏
const star = async (req, res) => {
    let { user_id, post_id, type } = req.query;
    console.log(post_id, user_id, type)
    let sql = {
        'star': `insert into isstar (post_id,user_id) values (?,?)`,
        'unstar': `delete from isstar where post_id=? and user_id=?`
    };
    let sqlArr = [post_id, user_id];
    let result = await dbConfig.SySqlConnect(sql[type], sqlArr);
    console.log(sql[type], result)
    if (result.affectedRows == 1) {
        res.send({
            code: 200,
            msg: 'success'
        })
    } else {
        res.send({
            code: 400,
            msg: 'empty'
        })
    }
}
// 
const like = async (req, res) => {
    let { user_id, post_id, type } = req.query;
    console.log(post_id, user_id, type)
    let sql = {
        'like': `insert into islike (post_id,user_id) values (?,?)`,
        'unlike': `delete from islike where post_id=? and user_id=?`
    };
    let sqlArr = [post_id, user_id];
    let result = await dbConfig.SySqlConnect(sql[type], sqlArr);
    if (result.affectedRows == 1) {
        res.send({
            code: 200,
            msg: 'success'
        })
    } else {
        res.send({
            code: 400,
            msg: 'empty'
        })
    }
}

//关键词推荐
const pushKeyWord = async (req, res) => {
    const num = req.query.num || 6
    let sql = ` select * from keyword order by hot desc`
    let sqlArr = [];
    let result = await dbConfig.SySqlConnect(sql, sqlArr);
    if (result) {
        res.send({
            data: result.slice(0, num)
        })
    } else {
        res.send({
            data: 'errpr'
        })
    }
}

const searchPost = async (req, res) => {
    const { data , postId } = req.body
    // var sql = `SELECT * FROM post WHERE CONCAT(title,details) LIKE '%${data}%'`;
    var sql = `SELECT * FROM post `+`${data || postId ? 'WHERE':''}`+ ` ${data ? `CONCAT(title,details) LIKE '%${data}%'`:``} `+`${data && postId ? 'and':''}`+` ${postId ? ` id = ${postId}` : ``}`;
    console.log(sql)
    var sqlArr = [];
    let result = await dbConfig.SySqlConnect(sql, sqlArr)
    if (result.length) {
        res.send({
            msg: '相关信息',
            status: 0,
            data: result

        });
    }
    else {
        res.send({
            msg: '未找到相关信息',
            status: -1
        });
    }
}

const pushPostTitle = async (req, res) => {
    let sql = `select * from post`
    let sqlArr = [];
    let result = await dbConfig.SySqlConnect(sql, sqlArr);
    let temp = [];
    result.map(item => {
        temp.push({ value: item.title, id: item.id })
    })
    if (result) {
        res.send({
            data: temp
        })
    } else {
        res.send({
            data: 'error'
        })
    }
}

const findisLike = async (postId, userId) => {
    var sql = `select islike from islike where postId=? && userId = ?`;
    var sqlArr = [postId, userId]
    let result = await dbConfig.SySqlConnect(sql, sqlArr);
    console.log(result)
}
//文章详情
const postDetail = async (req, res) => {
    const { id, userId } = req.query
    var sql = `SELECT
                    a.*,
                    b.islike,
                    c.isstar
                FROM
                    post AS a
                    left JOIN islike AS b ON a.id = b.post_id && b.user_id = ?
                    left JOIN isstar AS c ON a.id = c.post_id && c.user_id = ?
                    
                WHERE
                    a.id = ?  `;
    var sqlArr = [userId, userId, id];
    let result = (await dbConfig.SySqlConnect(sql, sqlArr))
    let userInfo = await dbConfig.SySqlConnect(`SELECT
                                                    a.user_name,
                                                    a.user_pic ,
                                                    a.user_id,
                                                    b.isfollow
                                                FROM
                                                    users AS a
                                                    left JOIN isfollow AS b ON a.user_id = b.follow_id && b.user_id = ${userId}
                                                    
                                                WHERE
                                                    a.user_id =  ${result[0].user_id}`, [])
    let keywords = await dbConfig.SySqlConnect(`select * from post_keyword where post_id = ${id}`, [])
    result[0].authInfo = userInfo[0];
    result[0].keywords = keywords;
    if (result.length) {
        dbConfig.sqlConnect(`UPDATE post SET hot = hot + 1 WHERE id =${id}`, [])
        res.send({
            status: 0,
            data: result[0]

        });
    }
    else {
        res.send({
            msg: '未找到相关信息',
            status: -1
        });
    }
}

const pushAnswer = async (req, res) => {
    let { userId, postId, value, top } = req.body;
    let sql = 'insert into answer (user_id,post_id,value,top) values (?,?,?,?)';
    let sqlArr = [userId, postId, value, top || 0];
    await dbConfig.SySqlConnect(sql, sqlArr).then(msg => {
        console.log(msg)
        if (!msg.Error) {
            res.send({
                status: 200,
                mag: 'success'
            })
        } else {
            res.send({
                status: -1,
                mag: 'unknow'
            })
        }
    }).catch(msg => {
        res.send({
            status: -1,
            msg: 'data error'
        })
    })

}

const pushAnsTalk = async (req, res) => {
    let { userId, ansId, value } = req.body;
    let sql = 'insert into ans_talk (user_id,ans_id,value) values (?,?,?)';
    let sqlArr = [userId, ansId, value];
    await dbConfig.SySqlConnect(sql, sqlArr).then(msg => {
        console.log(msg)
        if (!msg.Error) {
            res.send({
                status: 200,
                mag: 'success'
            })
        } else {
            res.send({
                status: -1,
                mag: 'unknow'
            })
        }
    }).catch(msg => {
        res.send({
            status: -1,
            msg: 'data error'
        })
    })

}

const deleAnswer = async (req, res) => {
    let { userId, ansId } = req.body;
    let sql = userId === 'master' ? 'DELETE FROM answer WHERE id = ? ' : 'DELETE FROM answer WHERE id = ? and user_id = ? ';

    let sqlArr = [ansId, userId];
    await dbConfig.SySqlConnect(sql, sqlArr).then(msg => {
        if (msg.affectedRows == 1) {
            res.send({
                status: 200,
                mag: 'success'
            })
        } else {
            res.send({
                status: -1,
                mag: '查询条件不存在'
            })
        }
    }).catch(msg => {
        res.send({
            status: -1,
            msg: 'data error'
        })
    })

}

const deleAnsTalk = async (req, res) => {
    let { userId, talkId, } = req.body;
    let sql = userId === 'master' ? 'DELETE FROM ans_talk WHERE id = ? ' : 'DELETE FROM ans_talk WHERE id = ? and user_id = ? ';
    let sqlArr = [talkId, userId];
    await dbConfig.SySqlConnect(sql, sqlArr).then(msg => {
        if (msg.affectedRows == 1) {
            res.send({
                status: 200,
                mag: 'success'
            })
        } else {
            res.send({
                status: -1,
                mag: '查询条件不存在'
            })
        }
    }).catch(msg => {
        res.send({
            status: -1,
            msg: 'data error'
        })
    })

}

const answerList = async (req, res) => {
    let { userId, postId } = req.body;
    console.log(userId , postId)
    let sql = `SELECT
                    a.*,
                    b.user_name,
                    b.user_pic 
                FROM
                    answer AS a
                    LEFT JOIN users AS b ON a.user_id = b.user_id 
                WHERE
                    a.post_id = ?
                ORDER BY
                    top DESC`;

    let sqlArr = [postId, userId];
    let result = await dbConfig.SySqlConnect(sql, sqlArr).then(msg => {
        return msg
    }).catch(msg => {
        res.send({
            status: -1,
            msg: 'data error'
        })
    })
        res.send({
            status: 200,
            data: result
        })
 

}

const ansTalkList = async (req, res) => {
    let { userId, ansId } = req.body;
    console.log(userId , ansId)
    let sql = `SELECT
                    a.*,
                    b.user_name,
                    b.user_pic 
                FROM
                    ans_talk AS a
                    LEFT JOIN users AS b ON a.user_id = b.user_id 
                WHERE
                    a.ans_id = ?
                ORDER BY create_time DESC`;
    let sqlArr = [ansId, userId];
    let result = await dbConfig.SySqlConnect(sql, sqlArr).then(msg => {
        return msg
    }).catch(msg => {
        res.send({
            status: -1,
            msg: 'data error'
        })
    })
   
        res.send({
            status: 200,
            data: result
        })
 
}

var followList = async (req, res) => {
    var {userId} =req.query
    var sql = `SELECT
                    a.*,
                    b.isfollow
                FROM
                    post AS a
                    LEFT JOIN isfollow AS b ON a.user_id = b.follow_id 
                WHERE
                    b.user_id = ?`;
    var sqlArr = [userId];
    let result =await dbConfig.SySqlConnect(sql, sqlArr).then(msg => {
        return msg
    }).catch(msg => {
        res.send({
            status: -1,
            msg: 'data error'
        })
    })
   
    res.send({
        status: 200,
        data: result
    })

}
module.exports = {
    uploadMoreImg,
    publish,
    follow,
    unfollow,
    pushKeyWord,
    searchPost,
    pushPostTitle,
    postDetail,
    star,
    like,
    pushAnswer,
    pushAnsTalk,
    deleAnswer,
    deleAnsTalk,
    ansTalkList,
    answerList,
    followList
}