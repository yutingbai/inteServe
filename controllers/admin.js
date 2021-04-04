
const dbconfig = require('../util/dbconfig');

var index = async (req, res, next) => {
    res.send({
        msg: '管理员权限',
        status: 0
    });
}

var usersList = async (req, res) => {
    var sql = 'select * from users';
    var sqlArr = [];

    return dbConfig.sqlConnect(sql, sqlArr)
if (result) {
    res.send({
        msg: '所有用户信息',
        status: 0,
        data: {
            usersList: result
        }
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
    var { email } = req.query;
    var result = await UserModel.deleteUser(email);
    if (result.n) {
        res.send({

            msg: '账号删除操作成功',
            status: 0
        });
    }
    else {
        res.send({
            msg: '账号删除操作失败',
            status: -1
        });
    }
}


module.exports = {
    index,
    usersList,
    deleteUser
};