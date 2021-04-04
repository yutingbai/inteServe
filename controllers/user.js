var { Email, SetCrypto } = require('../util/config');
const dbconfig = require('../util/dbconfig');
//邮箱验证码
const verify = (req, res, next) => {
    var { email } = req.query;
    var verify = Email.verify;
    var mailOptions = {
        from: 'yumilili yutingbai990901@qq.com',
        to: email,
        subject: '《数据结构》智能答疑系统',
        html: "<p>感谢您使用《数据结构》智能答疑系统</p><p style='text-indent: 60px;'><b>您此次的验证码为：" + verify + "</b></p><p style='text-indent: 230px;'>祝您生活愉快!</p><p style='text-indent: 230px;'>【yumilili】</p>",
    }
    Email.transporter.sendMail(mailOptions, (err) => {
        if (err) {
            res.send({
                msg: '验证码发送失败',
                status: -1
            });

        } else {
            req.session.verify = verify;
            req.session.email = email;
            req.session.time = Email.time;
            console.log(req.session)
            res.send({
                msg: '验证码发送成功',
                status: 0
            });

        }

    });
}
//检测邮箱or用户名是否已经注册
const findEmail = async (username, email) => {
    var sql = 'select * from users where user_name=? or user_email=?';
    var sqlArr = [username, email];
    let res = await dbConfig.SySqlConnect(sql, sqlArr)
    return (res.length > 0 ? true : false)
}
//post 注册
const signup = async (req, res, next) => {
    var { username, password, email, verify } = req.body;
    console.log(email, verify, req.session.email)
    const isregister = await findEmail(username, email);
    if (isregister) {
        res.send({
            msg: '用户名或邮箱已存在，请尝试修改用户名或找回密码',
            status: 0
        });
        return;
    }
    if (email !== req.session.email || verify !== req.session.verify) {
        res.send({
            msg: '验证码错误',
            status: -1
        });
        return;
    }
    if ((Email.time - req.session.time) / 1000 > 3600) {
        res.send({
            msg: '验证码已过期',
            status: -3
        });
        return;
    }


    var sql = 'insert into users (user_name,user_email ,user_pass) value (?,?,?)'
    var sqlArr = [username, email, SetCrypto(password)]
    let result = await dbConfig.SySqlConnect(sql, sqlArr)
    if (result) {
        let user = await getUser(email);
        await creatUserInfo(user[0].user_id)
        res.send({
            msg: '注册成功',
            status: 0
        });
    } else {
        res.send({
            msg: '注册失败',
            status: -2
        });
    }


}
//获取用户信息
const getUser = (useremail) => {
    let sql = `select * from users where user_email =?`;
    let sqlArr = [useremail]
    return dbconfig.SySqlConnect(sql, sqlArr);
}
//创建用户信息表
const creatUserInfo = (userId) => {
    let sql = `insert into userinfo (user_id, user_gender , user_class) values (?,?,?)`;
    let sqlArr = [userId, 18, '未设置']
    return dbconfig.SySqlConnect(sql, sqlArr);
}
//获取用户详情
const getUserInfo = (userId) => {
    let sql = `select user_gender,user_class from userinfo where user_id=?`
    let sqlArr = [userId]
    return dbConfig.SySqlConnect(sql, sqlArr);
}
//post 登录
const login = async (req, res, next) => {
    var { username, password } = req.body;
    // if (verifyImg !== req.session.verifyImg) {
    //     res.send({
    //         msg: '验证码输入不正确',
    //         status: -3
    //     });
    //     return;
    // }
    let sql = `select * from users where user_email=? and user_pass=? or user_name=? and user_pass=?`;
    let sqlArr = [username, SetCrypto(password), username, SetCrypto(password)]
    var result = await dbConfig.SySqlConnect(sql, sqlArr)
    console.log(result)

    if (result.length === 0) {
        res.send({
            msg: '用户名或密码错误，登录失败',
            status: -1
        });
    } else {
        req.session.userId = result.user_id;
        result[0].userInfo = await getUserInfo(result[0].user_id)
        res.send({
            msg: '登录成功',
            status: 0,
            data: result[0]
        });

    }
}
//get
var logout = async (req,res,next)=>{
    req.session.username = '';
	res.send({
		msg : '退出成功',
		status : 0
	});
}


module.exports = {
    verify,
    signup,
    login,
    logout
};