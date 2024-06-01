const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Refuelling = new Schema({
    vehicle_id:  Schema.Types.ObjectId,
    date: { type: String, default: Date.now },
    time: String,
    odometer: Number,
    fuel_object: [Schema.Types.ObjectId],
    gas_station: String,
    notes: String 
  });


 module.exports = mongoose.model('Refuelling', Refuelling);