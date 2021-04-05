
const dbConfig = require('../util/dbconfig');

var index = async (req, res, next) => {
    res.send({
        msg: '管理员权限',
        status: 0
    });
}

var usersList = async (req, res) => {
    var sql = 'select * from users';
    var sqlArr = [];
    let result =await dbConfig.SySqlConnect(sql, sqlArr)
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
    var { userId} = req.body;
    var sql = `delete t1,t2 from users as t1 left join userInfo as t2 on t1.user_id=t2.user_id where t1.user_id=?`
    var sqlArr=[userId]
    let result = await dbConfig.SySqlConnect(sql , sqlArr);
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


module.exports = {
    index,
    usersList,
    deleteUser
};