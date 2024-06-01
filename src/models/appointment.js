const mongoose = require('mongoose');
const { Schema } = mongoose;

const Appointment = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // assuming there's an 'Appointment' model
        default: ""
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carServiceCenter', // assuming there's an 'Appointment' model
        default: ""
    },
    selectedTime: {
        type: String,
        required: true
    },
    selectedDate: {
        type: Date,
        required: true
    },
    make: {
        type: String,
        default: ""
    },
    year: {
        type: Number,
        required: true
    },
    model: {
        type: String,
        default: ""
    },
    comment: {
        type: String,
        default: ""
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Appointment', Appointment);


