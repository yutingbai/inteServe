var nodemailer = require('nodemailer');
var crypto = require('crypto');
var Email = {
	config : {
		host: "smtp.qq.com",
	    port: 587,
	    auth: {
				user: 'yutingbai990901@qq.com', 
				pass: 'lsgxfzftszovbcga'
	    }
	},
	get transporter(){
		return nodemailer.createTransport(this.config);
	},
	get verify(){
		return Math.random().toString().substring(2,6);
	},
	get time(){
		return Date.now();
	}
};
var SetCrypto = (info)=>{
	return crypto.createHmac('sha256', '$#%$#%$#%')
					.update(info)
                    .digest('hex');
};
module.exports = {
	Email,
	SetCrypto
};