const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Comment = new Schema({
  comment_content: String,
  user_id: Schema.Types.ObjectId,
  dateCreated: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Comment', Comment);