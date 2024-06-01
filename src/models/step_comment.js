const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Step_Comment = new Schema({
  comment_content: String,
  user_id: Schema.Types.ObjectId,
  dateCreated: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Step_Comment', Step_Comment);