const mongoose = require('mongoose')

const customer = new mongoose.Schema({
    email: {
        type: String,
        require: true,
        trim: true
    },
    hashPassword: {
        type: String,
        trim: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
})

module.exports = mongoose.model('Customer', customer)