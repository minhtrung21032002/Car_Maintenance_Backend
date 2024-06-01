const mongoose = require('mongoose');
const { Schema } = mongoose;

const Reviewer = new Schema({
    reviewer_name: {
        type: String,
        default: ""
    },
    reviewer_date: {
        type: Date,
        default: null
    },
    review_star: {
        type: Number,
        default: 0
    },
    reviewer_comment: {
        type: String,
        default: ""
    },

});

module.exports = mongoose.model('Reviewer', Reviewer);

