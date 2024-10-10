// models/Birthday.js
const mongoose = require('mongoose');

const birthdaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        // You can add email validation here if necessary
    },
    date: {
        type: Date,
        required: true,
    },
});

const Birthday = mongoose.model('Birthday', birthdaySchema);

module.exports = Birthday;
