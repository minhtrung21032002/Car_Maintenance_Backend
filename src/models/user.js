const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const User = new Schema({
    member_since: {type: String},
    loginOnce : {type: Boolean},
    firebase_id: { type: String, default: '' },
    firebase_userId: { type: String, default: '' },
    user_img: { type: String, default: 'None' },
    password: String,
    user_name: { type: String, default: function() {
      return this.user_email || 'None';
    }},
    signIn_method: { type: String, default: 'None' },
    user_email : String,
    user_phone: { type: String, default: "None" },
    total_guides: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    badges: { type: [Schema.Types.ObjectId], default: [] },
  })


 module.exports = mongoose.model('User', User);