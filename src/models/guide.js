const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Guide = new Schema({
    guide_title: {type: String},
    img_url: {type: String},
    blog_id: {type: mongoose.Schema.Types.ObjectId, ref: 'blogs'},
    img_local: {type: String},
    user_id : Schema.Types.ObjectId
  })


 module.exports = mongoose.model('Guide', Guide);