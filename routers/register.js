var svgCaptcha = require('svg-captcha')
var User = require('../js/user')
var md5 = require('md5')

var register = {
    getCaptcha: function (request, response) {
        var captcha = svgCaptcha.create({
            size: 4, // 验证码长度
            ignoreChars: '0o1iIl', // 验证码字符中排除 0o1i
            noise: 1, // 干扰线条的数量
            color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
            background: '#cc9966', // 验证码图片背景颜色
            // 翻转颜色 
            inverse: false,
            // 字体大小 
            fontSize: 36,
            // 宽度 
            width: 80,
            // 高度 
            height: 30,
        })
        // 保存到session,忽略大小写 
        request.session.captcha = captcha.text.toLowerCase()
        capText = request.session.captcha
        //保存到cookie 方便前端调用验证
        response.cookie('captcha', request.session)
        return { captcha, capText }
    },
    registerVerify:function(request, response,cap) {
        var myreg = /^[1][3,4,5,7,8][0-9]{9}$/ //手机号正则
        var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/ //密码正则
        var body = request.body
    User.findOne({ phoneNum: body.phoneNum }, function (err, data) {
        if (err) {
            return response.status(500).send({
                err_code: 500,
                message: '服务端错误'
            })
        }
        // 手机号码验证
        if (!myreg.test(body.phoneNum)) {
            return response.send({
                err_code: 1,
                message: '请输入正确的手机号码'
            })
        }
        // 查询手机号是否存在
        if (data) {
            return response.status(200).send({
                err_code: 2,
                message: '该手机号已注册，请更换手机号'
            })
        }
        // 校验密码格式
        if (!reg.test(body.password)) {
            return response.status(200).send({
                err_code: 3,
                message: '密码格式错误'
            })
        }
        // 密码是否一致
        if (body.password !== body.conPassword) {
            return response.status(200).send({
                err_code: 4,
                message: '两次密码输入不一致'
            })
        }
        // 验证码是否正确
        console.log('上传的验证码1' + body.verify)
        var verify = body.verify
        console.log(verify.toLowerCase())
        if (verify !== cap) {
            return response.status(200).send({
                err_code: 6,
                message: '验证码错误'
            })
        }
        // 验证是否同意协议
        if (!body.checked) {
            return response.status(200).send({
                err_code: 5,
                message: '请同意协议'
            })
        }
        body.password = md5(md5(body.password) + 'lh')

        new User(body).save(function (err, isLogin) {
            if (err) {
                return response.status(500).send({
                    err_code: 500,
                    message: '服务端错误，请重试'
                })
            }
            // 注册成功，使用session记录用户登陆的状态
            request.session.isLogin = isLogin
            return response.status(200).send({
                err_code: 0,
                message: '注册成功'
            })
        })
    })
    }

}
module.exports = register