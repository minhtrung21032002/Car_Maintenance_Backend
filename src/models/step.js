const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Step = new Schema({
  comments_id: [Schema.Types.ObjectId], // default empty list
  step_number: [Number],
  video_url: String, // default empty string
  imgs: [{
    img_url: String,
    img_number: Number
  }],
  step_content: [{
    icon: String, // defaultblack
    content_div_number: Number,
    content_div: String,
  }]
  });


module.exports = mongoose.model('Step', Step);