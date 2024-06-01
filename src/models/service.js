const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Service = new Schema({
    vehicle_id:  Schema.Types.ObjectId,
    date: { type: String, default: Date.now },
    time: String,
    odometer: Number,
    service_type: String,
    place: String,
    fuel_type: String,
    cost: Number,
    notes: String,
});


module.exports = mongoose.model('Service', Service);