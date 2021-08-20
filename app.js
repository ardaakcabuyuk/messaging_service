const express = require("express")
const mongoose = require("mongoose")
const AuthRouter = require("./routes/auth")
const MsgRouter = require("./routes/messaging")
const session = require("express-session")

const app = express()

app.use(express.json())

// Connection URL
const url = 'mongodb://localhost:27017/'

// Database Name
const dbName = 'messaging_service'

mongoose.connect(url + dbName, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
    console.log("connected.")
})

/*app.use((err, req,res,next) => {
    res.status(err.status || 500).send(err.message);
    logger.error(`${err.status || 500} - ${res.statusMessage} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
})

app.use((req,res,next) => {
    res.status(404).send("404 ERROR");
    logger.error(`400 || ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
})*/

app.use(session({secret: "fawyueh4t48aw9hfg4", resave: false, saveUninitialized: true}))
app.use('/api', MsgRouter)
app.use('/auth', AuthRouter)

app.listen(3000, () => {
    console.log("Server is running at port 3000")
})

console.log('done.')

