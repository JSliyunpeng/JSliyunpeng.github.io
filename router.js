var express = require('express')
var fs = require('fs')
var md5 = require('md5')
var User = require('./js/user')
var bodyParser = require('body-parser')
var Login = require('./routers/login')
var svgCaptcha = require('svg-captcha')
var captchapng = require('captchapng')
var Register = require('./routers/register')
var router = express.Router()

var myreg = /^[1][3,4,5,7,8][0-9]{9}$/ //手机号正则
var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/ //密码正则
var captcha //验证码返回值
var cap

//响应主页
router.get('/', function (request, response) {
    // 读取轮播图路径
    fs.readFile('./lib/slide.json', 'utf8', function (err, data) {
        if (err) {
            console.log('读取文件失败')
        }
        var data = JSON.parse(data) //data一定要转成字符串格式，否则无法读取
        response.render('index.html', {
            mslide: data.mslide,
            pcslide: data.pcslide,
            isLogins: request.session.isLogin
        })
    })

})

// 响应注册页面
router.get('/register/', function (request, response) {
    // 获取验证码
    captcha = Register.getCaptcha(request, response)
    cap = captcha.capText
    response.render('register.html', {
        captcha: captcha.captcha
    })
    // var captcha = svgCaptcha.create({
    //     size: 4, // 验证码长度
    //     ignoreChars: '0o1i', // 验证码字符中排除 0o1i
    //     noise: 1, // 干扰线条的数量
    //     color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
    //     background: '#cc9966', // 验证码图片背景颜色
    //     // 翻转颜色 
    //     inverse: false,
    //     // 字体大小 
    //     fontSize: 36,
    //     // 宽度 
    //     width: 80,
    //     // 高度 
    //     height: 30,
    // })
    // // 保存到session,忽略大小写 
    // request.session.captcha = captcha.text.toLowerCase()
    // // cap = request.session.captcha
    // //保存到cookie 方便前端调用验证
    // response.cookie('captcha', request.session)
    // response.setHeader('Content-Type', 'image/svg+xml')
    // response.write(String(captcha.data));
    // response.end();
    // response.render('register.html', {
    //     captcha: captcha
    // })
})

// 处理注册请求
router.post('/register/', function (request, response) {
    Register.registerVerify(request, response, cap)
    // var body = request.body
    // User.findOne({ phoneNum: body.phoneNum }, function (err, data) {
    //     if (err) {
    //         return response.status(500).send({
    //             err_code: 500,
    //             message: '服务端错误'
    //         })
    //     }
    //     // 手机号码验证
    //     if (!myreg.test(body.phoneNum)) {
    //         return response.send({
    //             err_code: 1,
    //             message: '请输入正确的手机号码'
    //         })
    //     }
    //     // 查询手机号是否存在
    //     if (data) {
    //         return response.status(200).send({
    //             err_code: 2,
    //             message: '该手机号已注册，请更换手机号'
    //         })
    //     }
    //     // 校验密码格式
    //     if (!reg.test(body.password)) {
    //         return response.status(200).send({
    //             err_code: 3,
    //             message: '密码格式错误'
    //         })
    //     }
    //     // 密码是否一致
    //     if (body.password !== body.conPassword) {
    //         return response.status(200).send({
    //             err_code: 4,
    //             message: '两次密码输入不一致'
    //         })
    //     }
    //     // 验证码是否正确
    //     console.log('上传的验证码1' + body.verify)
    //     var verify = body.verify
    //     console.log(verify.toLowerCase())
    //     if (verify !== cap) {
    //         return response.status(200).send({
    //             err_code: 6,
    //             message: '验证码错误'
    //         })
    //     }
    //     // 验证是否同意协议
    //     if (!body.checked) {
    //         return response.status(200).send({
    //             err_code: 5,
    //             message: '请同意协议'
    //         })
    //     }
    //     body.password = md5(md5(body.password) + 'lh')

    //     new User(body).save(function (err, isLogin) {
    //         if (err) {
    //             return response.status(500).send({
    //                 err_code: 500,
    //                 message: '服务端错误，请重试'
    //             })
    //         }
    //         // 注册成功，使用session记录用户登陆的状态
    //         request.session.isLogin = isLogin
    //         return response.status(200).send({
    //             err_code: 0,
    //             message: '注册成功'
    //         })
    //     })
    // })

})

//响应登录页面
router.get('/login/', function (request, response) {
    response.render('login.html')
})

// 处理登录请求
router.post('/login/', function (request, response) {
    var body = request.body
    console.log('body的数据类型：'+typeof body)
    var phoneNum = body.phoneNum
    console.log(body)
    console.log('---------------------------------------')
    User.findOne({phoneNum:phoneNum},function(err,user){
            console.log('user:'+user.password)
            console.log('user的数据类型：'+typeof user)
            if (err) {
                return response.status(500).send({
                    err_code: 500,
                    message: '服务端错误'
                })
            }
            // 验证手机号格式
            if (!myreg.test(body.phoneNum)) {
                return response.send({
                    err_code: 1,
                    message: '请输入正确的手机号码'
                })
            }
            if(user===null){
                return response.status(200).send({
                    err_code: 2,
                    message: '该手机号未注册，请注册之后登陆'
                })
            }
            if (user.phoneNum !== body.phoneNum) {
                return response.status(200).send({
                    err_code: 2,
                    message: '该手机号未注册，请注册之后登陆'
                })
            }
            if (user.password !== md5(md5(body.password) + 'lh')) {
                return response.status(200).send({
                    err_code: 3,
                    message: '密码错误'
                })
            }
            request.session.isLogin = body
            return response.status(200).send({
                err_code: 0,
                message: '登陆成功'
            })
    })

})

// 退出请求
router.get('/loginout/', function (request, response) {
    request.session.isLogin = null
    response.redirect('/login')
})

router.get('/getCaptcha/', function (request, response) {
    // 获取验证码
    captcha = Register.getCaptcha(request, response)
    cap = captcha.capText
    return response.status(200).send({
        captcha: captcha.captcha
    })
    // var captcha = svgCaptcha.create({
    //     size: 4, // 验证码长度
    //     ignoreChars: '0o1i', // 验证码字符中排除 0o1i
    //     noise: 1, // 干扰线条的数量
    //     color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
    //     background: '#cc9966', // 验证码图片背景颜色
    //     // 翻转颜色 
    //     inverse: false,
    //     // 字体大小 
    //     fontSize: 36,
    //     // 宽度 
    //     width: 80,
    //     // 高度 
    //     height: 30,
    // })
    // // 保存到session,忽略大小写 
    // request.session.captcha = captcha.text.toLowerCase()
    // cap = request.session.captcha
    // //保存到cookie 方便前端调用验证
    // response.cookie('captcha', request.session)
    // // response.setHeader('Content-Type', 'image/svg+xml')
    // // response.write(String(captcha.data));
    // // response.end();
    // console.log('yanzhegnma' + captcha.text)
    // captcha = captcha.text
    // return response.status(200).send({
    //     captcha: captcha
    // })
})


module.exports = router