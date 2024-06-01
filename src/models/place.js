const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Place = new Schema({
  place_name: String,
  place_address: String,
});


module.exports = mongoose.model('Place', Place);