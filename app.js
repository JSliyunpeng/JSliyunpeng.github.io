var express = require('express')
var fs = require('fs')
var path = require('path')
var http = require("http")
var cookie = require('cookie-parser')
var bodyParser = require('body-parser')
var svgCaptcha = require('svg-captcha')
var session = require('express-session')
var artTemplate = require('art-template')
var router = require('./router')
var app = express()

//开放静态资源
app.use('/js', express.static(path.join(__dirname, './js/')))
app.use('/css/', express.static(path.join(__dirname, '/./css/')))
app.use('/lib/', express.static(path.join(__dirname, './lib/')))
app.use('/images/', express.static(path.join(__dirname, './images/')))
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))


// 配置静态模板
app.engine('html', require('express-art-template'));
app.set('view options', {
  debug: process.env.NODE_ENV !== 'production'
});

// 引入解析post请求模块
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use(cookie());

app.use(session({
  // 配置加密字符串，它会在原有加密基础之上和这个字符串拼起来去加密
  // 目的是为了增加安全性，防止客户端恶意伪造
  secret: 'lh',
  resave: false,
  saveUninitialized: true, // 无论你是否使用 Session ，我都默认直接给你分配一把钥匙
  cookie: {
    maxAge: 1000 * 60 * 60 // default session expiration is set to 1 hour
  }
}))

app.use(router)

app.listen(3000, function () {
  console.log('running...')
})
module.exports = app
