var mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1/weijinsuo', { useNewUrlParser: true })
var Schema = mongoose.Schema

var slideSchema = new Schema({
  slideUrl: {
    type: String,
    default: ''
  }
})

module.exports = mongoose.model('Slide', slideSchema)