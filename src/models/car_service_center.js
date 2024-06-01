const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const carServiceCenter = new Schema({
    shop_images: {
        type: [String],
        default: []
    },
    shop_website: {
        type: String,
        default: ""
    },
    shop_description: {
        type: String,
        default: ""
    },
    shop_short_description: {
        type: String,
        default: ""
    },
    shop_name: {
        type: String,
        default: ""
    },
    shop_address: {
        type: String,
        default: ""
    },
    shop_distance: {
        type: Number,
        default: 0
    },
    open_time: {
        type: Date,
        default: null
    },
    soonest_booking_time: {
        type: Date,
        default: null
    },
    soonest_booking_date: {
        type: Date,
        default: null
    },
    shop_phone: {
        type: Number,
        default: 0
    },
    shop_gmail: {
        type: String,
        default: ""
    },
    shop_free_dates: {
        type: [Date],
        default: []
    },
    shop_reputation_star: {
        type: Number,
        default: 0
    },
    shop_reviewers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Reviewer', // assuming there's a 'Reviewer' model
        default: []
    },
    shop_appointments: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Appointment', // assuming there's an 'Appointment' model
        default: []
    },
    shop_coordinate: {
        type: [Number], // Array of Numbers
        default: [0, 0] // Default coordinates (latitude, longitude)
    }
});


module.exports = mongoose.model('carServiceCenter', carServiceCenter);