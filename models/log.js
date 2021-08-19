const mongoose = require('mongoose')
const { Schema } = mongoose

const log = new Schema({
    username: {
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

module.exports = mongoose.model("Log", log)