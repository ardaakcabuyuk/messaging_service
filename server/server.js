const express = require("express")
const AuthRouter = require("../routes/auth")
const MsgRouter = require("../routes/messaging")
const session = require("express-session")
require('dotenv').config()

function createServer() {
    const app = express()
    app.use(express.json())
    app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true}))
    app.use('/api', MsgRouter)
    app.use('/auth', AuthRouter)
    return app
}

module.exports = createServer