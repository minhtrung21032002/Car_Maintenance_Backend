const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Gas_station = new Schema({
  gas_station_name: String,
  gas_station_address: String,
});


module.exports = mongoose.model('Gas_station', Gas_station);