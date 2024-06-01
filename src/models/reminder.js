const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Reminder = new Schema({
    vehicle_id:  Schema.Types.ObjectId,
    date: String,
    odometer: Number,
    time: String,
    service_type: String,
    type_notification: String,
    notes: String,
});


module.exports = mongoose.model('Reminder', Reminder);