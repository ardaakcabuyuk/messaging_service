const mongoose = require('mongoose')
const { Schema } = mongoose

const blocked = new Schema({
    user: {
        type: String,
        required: true
    },
    activity: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Blocked", blocked)