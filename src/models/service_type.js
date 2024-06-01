const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Service_type = new Schema({
  service_type_name: String,
});


module.exports = mongoose.model('Service_type', Service_type);