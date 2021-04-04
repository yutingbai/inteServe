var dbConfig = require('../util/dbconfig')

var getusers = (req, res) => {
    var sql = 'select * from users';
    var sqlArr = [];
    var callBack = (err, data) => {
        if (err) {
            res.send('error')
        } else {
            res.send({
                'list': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}

var getpost = (req, res) => {
    let {id} = req.query;
    var sql = `select * from post where user_id=?`;
    var sqlArr = [id];
    var callBack = (err, data) => {
        if (err) {
            res.send('error')
        } else {
            res.send({
                'list': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
module.exports = {
    getusers,
    getpost
}