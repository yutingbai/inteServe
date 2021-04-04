const mysql = require('mysql')
module.exports = {
    config: {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '990901',
        database: 'intesystem_db'
    },
    sqlConnect: function (sql, sqlArr, callBack) {
        var pool = mysql.createPool(this.config);
        pool.getConnection((err, conn) => {
            if (err) {
                console.log('connect error')
                return;
            }
            conn.query(sql, sqlArr, callBack)
            conn.release()

        })
    },
    SySqlConnect: function (SySql, sqlArr) {
        return new Promise((resolve, reject) => {
            var pool = mysql.createPool(this.config);
            pool.getConnection((err, conn) => {
                if (err) {
                    console.log('connect error')
                    reject(err)
                } else {
                    conn.query(SySql, sqlArr, (err,data)=>{
                        if(err){
                            reject(err)
                        }else{
                            resolve(data)
                        }
                    })
                    conn.release()
                }
            })
        }).catch((err)=>{
            console.log(err)
        })
    }
}