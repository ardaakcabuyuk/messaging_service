const mongoose = require('mongoose')
const { Schema } = mongoose

const blocked = new Schema({
    blocked: {
        type: String,
        required: true
    },
    by: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Blocked", blocked)