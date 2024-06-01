const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Fuel = new Schema({
  fuel_name: String,
});


module.exports = mongoose.model('Fuel', Fuel);