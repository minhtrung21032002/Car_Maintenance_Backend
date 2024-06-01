const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Admin = new Schema({
    user_name: String,
    password: String,
    last_access_date: String
    })

module.exports = mongoose.model('Admin', Admin);