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

var myreg = /^[1][3,4,5,7,8][0-9]{9}$/    //手机号正则
var reg = new RegExp(/[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/)   //密码正则
var cap

//响应主页
router.get('/', function (req, res) {
  // 读取轮播图路径
  fs.readFile('./lib/slide.json', 'utf8', function (err, data) {
    if (err) {
      console.log('读取文件失败')
    }
    var data = JSON.parse(data) //data一定要转成字符串格式，否则无法读取
    res.render('index.html', {
      mslide: data.mslide,
      pcslide: data.pcslide,
      isLogins: req.session.isLogin
    })
  })

})

// 响应注册页面
router.get('/register/', function (req, res) {
  // 获取验证码
  var captcha = svgCaptcha.create({
    size: 4, // 验证码长度
    ignoreChars: '0o1i', // 验证码字符中排除 0o1i
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
  req.session.captcha = captcha.text.toLowerCase()
  cap = req.session.captcha
  console.log('aaaaaa' + cap) //0xtg 生成的验证码
  //保存到cookie 方便前端调用验证
  res.cookie('captcha', req.session)
  // res.setHeader('Content-Type', 'image/svg+xml')
  // res.write(String(captcha.data));
  // res.end();
  console.log('生成的验证码' + cap)
  res.render('register.html', {
    captcha: captcha
  })
})

// 处理注册请求
router.post('/register/', function (req, res) {
  var body = req.body
  User.findOne({ phoneNum: body.phoneNum }, function (err, data) {
    if (err) {
      return res.status(500).send({
        err_code: 500,
        message: '服务端错误'
      }
      )
    }
    // 手机号码验证
    var body = req.body
    if (!myreg.test(body.phoneNum)) {
      return res.send({
        err_code: 1,
        message: '请输入正确的手机号码'
      })
    }
    // 查询手机号是否存在
    if (data) {
      return res.status(200).send({
        err_code: 2,
        message: '该手机号已注册，请更换手机号'
      })
    }
    // 校验密码格式
    if (!reg.test(body.password)) {
      return res.status(200).send({
        err_code: 3,
        message: '密码格式错误'
      })
    }
    // 密码是否一致
    if (body.password !== body.conPassword) {
      return res.status(200).send({
        err_code: 4,
        message: '两次密码输入不一致'
      })
    }
    // 验证码是否正确
    console.log('上传的验证码' + body.verify)
    var verify = body.verify
    console.log(verify.toLowerCase())
    if (verify !== cap) {
      return res.status(200).send({
        err_code: 6,
        message: '验证码错误'
      })
    }
    // 验证是否同意协议
    if (!body.checked) {
      return res.status(200).send({
        err_code: 5,
        message: '请同意协议'
      })
    }
    body.password = md5(md5(body.password) + 'lh')

    new User(body).save(function (err, isLogin) {
      if (err) {
        return res.status(500).send({
          err_code: 500,
          message: '服务端错误，请重试'
        })
      }
      // 注册成功，使用session记录用户登陆的状态
      req.session.isLogin = isLogin
      return res.status(200).send({
        err_code: 0,
        message: '注册成功'
      })
    })
  })

})

//响应登录页面
router.get('/login/', function (req, res) {
  res.render('login.html')
})

// 处理登录请求
router.post('/login/', function (req, res) {
  var body = req.body
  User.find({
    phoneNum: body.phoneNum,
    password: md5(md5(body.password) + 'lh')
  }, function (err, user) {
    if (err) {
      return res.status(500).send({
        err_code: 500,
        message: '服务端错误'
      })
    }
    // 验证手机号格式
    if (!myreg.test(body.phoneNum)) {
      return res.send({
        err_code: 1,
        message: '请输入正确的手机号码'
      })
    }
    if (!user.phoneNum === body.phoneNum) {
      return res.status(200).send({
        err_code: 2,
        message: '该手机号未注册，请注册之后登陆'
      })
    }
    if (!user.phoneNum === md5(md5(body.password))) {
      return res.status(200).send({
        err_code: 3,
        message: '密码错误'
      })
    }
    req.session.isLogin = body
    return res.status(200).send({
      err_code: 0,
      message: '登陆成功'
    })
  })
})

// 退出请求
router.get('/loginout/', function (req, res) {
  req.session.isLogin = null
  res.redirect('/login')
})

router.get('/api/getCaptcha', function (req, res, next) {
  var captcha = svgCaptcha.create({
    size: 4, // 验证码长度
    ignoreChars: '0o1i', // 验证码字符中排除 0o1i
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
  req.session.captcha = captcha.text.toLowerCase()
  console.log('aaaaaa' + req.session) //0xtg 生成的验证码
  //保存到cookie 方便前端调用验证
  res.cookie('captcha', req.session)
  // res.setHeader('Content-Type', 'image/svg+xml')
  // res.write(String(captcha.data));
  // res.end();
  // var cap = String(captcha.data)
  return res.send({
    captcha: captcha.data
  })
})


module.exports = router

