const express = require("express")
const mongoose = require("mongoose")
const createServer = require("./server/server")
require('dotenv').config()

const app = express()
app.use(express.json())

mongoose
    .connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        const app = createServer()
        app.listen(process.env.PORT, () => {
            console.log("Server is running at port " + process.env.PORT)
        })
    })

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
    console.log("connected.")
})

console.log('done.')

