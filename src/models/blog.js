const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Blog = new Schema({
    blog_title: { type: String },
    last_updated: { type: Date, default: Date.now },
    user_id:  Schema.Types.ObjectId ,
    introduction: String,
    conclusion: String,
    time: Number,
    difficulty: String,
    steps: [Schema.Types.ObjectId],
    summary_comments: [Schema.Types.ObjectId],
    number_access: Number,
    number_of_comments: Number,
    number_of_likes: Number,
    number_of_completed: Number,
  });


 module.exports = mongoose.model('Blog', Blog);