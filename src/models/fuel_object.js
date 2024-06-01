const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Fuel_object = new Schema({
    fuel_type: String,
    fuel_capacity: Number,
    fuel_price: Number,
    total_cost: Number
});


module.exports = mongoose.model('Fuel_object', Fuel_object);