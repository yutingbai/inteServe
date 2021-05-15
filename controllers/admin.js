
const dbConfig = require('../util/dbconfig');

var index = async (req, res, next) => {
    res.send({
        msg: '管理员权限',
        status: 0
    });
}

var usersList = async (req, res) => {
    var sql = `SELECT
                    a.*,
                    b.postCount
                FROM
                    users AS a
                    left JOIN userinfo AS b ON a.user_id = b.user_id`;
    var sqlArr = [];
    let result = await dbConfig.SySqlConnect(sql, sqlArr)
    if (result.length) {
        res.send({
            msg: '所有用户信息',
            status: 0,
            data: result

        });
    }
    else {
        res.send({
            msg: '获取用户信息失败',
            status: -1
        });
    }

}

var deleteUser = async (req, res, next) => {
    var { userId } = req.body;
    var sql = `delete t1,t2 from users as t1 left join userInfo as t2 on t1.user_id=t2.user_id where t1.user_id=?`
    var sqlArr = [userId]
    let result = await dbConfig.SySqlConnect(sql, sqlArr);
    if (result.affectedRows) {
        res.send({
            msg: '账号删除操作成功',
            status: 0
        });
    }
    else {
        res.send({
            msg: '未发现可删除账号',
            status: -1
        });
    }
}

var postList = async (req, res) => {
    var sql = 'select * from post';
    var sqlArr = [];
    let result = await dbConfig.SySqlConnect(sql, sqlArr)
    if (result.length) {
        res.send({
            msg: '所有问题信息',
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

}

var deletePost = async (req, res, next) => {
    var { id } = req.body;
    var sql = `DELETE FROM post WHERE id = ?`
    var sqlArr = [id]
    let result = await dbConfig.SySqlConnect(sql, sqlArr);
    if (result.affectedRows) {
        res.send({
            msg: '删除操作成功',
            status: 0
        });
    }
    else {
        res.send({
            msg: '未发现可删除id',
            status: -1
        });
    }
}
const searchUser = async (req, res) => {
    const { userId, userName } = req.body
    var sql = `SELECT * FROM  users AS a left JOIN userinfo AS b ON a.user_id = b.user_id ` + `${userName || userId ? 'Where' : ''}` + ` ${userName ? `a.user_name LIKE '%${userName}%'` : ``} ` + `${userName && userId ? 'and' : ''}` + ` ${userId ? ` a.user_id = ${userId}` : ``}`;
    console.log(sql)
    var sqlArr = [];
    let result = await dbConfig.SySqlConnect(sql, sqlArr).then(msg => {
        return msg
    }).catch(msg => {
        res.send({
            status: -1,
            msg: 'data error'
        })
    })
    if (result) {
        res.send({
            status: 0,
            data: result

        });
    } else {
        red.send({
            status: 0,
            data: 'error'
        })
    }


}





module.exports = {
    index,
    usersList,
    deleteUser,
    postList,
    deletePost,
    searchUser
};