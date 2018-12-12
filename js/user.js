var mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1/weijinsuo', { useNewUrlParser: true })
var Schema = mongoose.Schema

var userSchema = new Schema({
  phoneNum: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  reated_time: {
    type: Date,
    default: Date.now
  },
  last_modified_time: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: '/public/img/avatar-default.png'
  },
  gender: {
    type: Number,
    enum: [-1, 0, 1],
    default: '-1'
  },
  birthday: {
    type: Date,
  }
})

module.exports = mongoose.model('User', userSchema)