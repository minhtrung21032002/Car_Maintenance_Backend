const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Message = new Schema({
    user_id : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    send_date: {type: String},
    message_content: {type: String}
  })


 module.exports = mongoose.model('Message', Message);