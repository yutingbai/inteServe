var request = require('request')
const MD5 = require('md5-node')

const dependent = (req, res) => {
	const text = req.body.text
	let appid = "b7277bb1";
	let apikey = 'fe20a2c420822c5f86c6a42a11952e7c';
	let post_url = "http://ltpapi.xfyun.cn/v1/ke";
	let param = Buffer.from(JSON.stringify({ "type": "dependent" })).toString('base64')
	let curtime = parseInt(new Date().getTime() / 1000);
	let base64_param = MD5(apikey + curtime + param)

	let options = {
		url: post_url,
		headers: {
			"X-Appid": appid,
			"X-CurTime": curtime,
			'X-Param': param,
			"X-CheckSum": base64_param,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		form: {
			text
		}
	}
	request.post(options, (error, response, body) => {
		if (!error && response.statusCode == 200) {
			res.send(JSON.parse(body))
			return JSON.parse(body)
		} else {
			res.send({
				error
			})
			return error
		}

	})

}

const syncDependent = async (text) => {
	let appid = "b7277bb1";
	let apikey = 'fe20a2c420822c5f86c6a42a11952e7c';
	let post_url = "http://ltpapi.xfyun.cn/v1/ke";
	let param = Buffer.from(JSON.stringify({ "type": "dependent" })).toString('base64')
	let curtime = parseInt(new Date().getTime() / 1000);
	let base64_param = MD5(apikey + curtime + param)

	let options = {
		url: post_url,
		headers: {
			"X-Appid": appid,
			"X-CurTime": curtime,
			'X-Param': param,
			"X-CheckSum": base64_param,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		form: {
			text
		}
	}
	return new Promise(function (resolve, reject) {
		request.post(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log('success')
				resolve(JSON.parse(body).data.ke)
			} else {
				console.log(error)
				reject()
			}
		});
	})
}


module.exports = {
	dependent,
	syncDependent
}