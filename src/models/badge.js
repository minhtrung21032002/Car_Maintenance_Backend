const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Badge = new Schema({
    badge_icon: { type: String },
    badge_name: String,
    badge_description: String,
    })

module.exports = mongoose.model('Badge', Badge);