const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Vehicle = new Schema({
    user_id: String,
    manufacturer: String,
    model: String,
    type: String,
    name: String,
    fuel_type: { type: String},
    fuel_capacity: Number,
    odometer: Number,
    idenfication: String,
    license: String,
    chassis: String,
    notes: String,
    last_updated: { type: Date, default: Date.now },
    status: { type: String, default: "Active" }
});
module.exports = mongoose.model('Vehicle', Vehicle);
