const express = require("express")
const User = require("../models/user")
const Log = require("../models/log")
const logger = require('../utils/logger');
const app = express()

app.post("/register", async (req, res) => {
    let errorMsg = ""
    if (!req.session.user) {
        if (req.body.username == "" || req.body.password == "") {
            errorMsg = "enter valid credentials!"
            logError(req, errorMsg)
            return res.status(404).send(errorMsg)
        }

        User.findOne({username: req.body.username}, async function(err, user) {
            if (user) {
                errorMsg = "this user already exists!"
                logError(req, errorMsg)
                return res.status(404).send()
            }

            else {
                const user = new User(req.body)

                const log = new Log({
                    username: req.body.username,
                    activity: "registered"
                })

                try {
                    await user.save()
                    await log.save()
                    return res.send(user)
                } catch (error) {
                    logError(req, error.message)
                    return res.status(500).send(error)
                }
            }
        })
    }
    else {
        errorMsg = "a user is logged in right now! log out first!"
        logError(req, errorMsg, 404)
        return res.status(404).send(errorMsg)
    }
})

app.post("/login", async (req, res) => {
    let errorMsg = ""
    if (!req.session.user) {
        const username = req.body.username
        const password = req.body.password

        User.findOne({
                username: username
            },
            async function (err, user) {
                if (err) {
                    logError(req, err.message, 500)
                    return res.status(500).send(err.message)
                }

                if (!user) {
                    errorMsg = "incorrect credentials!"
                    logError(req, errorMsg, 404)
                    return res.status(404).send()
                }

                if (password.localeCompare(user.password)) {
                    const log = new Log({
                        username: username,
                        activity: "invalid login"
                    })

                    try {
                        await log.save()
                        errorMsg = "your password is wrong!"
                        logError(req, errorMsg, 404)
                        return res.status(404).send(errorMsg)
                    } catch (error) {
                        logError(req, error.message, 500)
                        return res.status(500).send(error.message)
                    }
                }

                req.session.user = user

                const log = new Log({
                    username: username,
                    activity: "login"
                })

                try {
                    await log.save()
                    return res.status(200).send("successfully logged in!")
                } catch (error) {
                    logError(req, error.message, 500)
                    return res.status(500).send(error.message)
                }

            }
        )
    }
    else {
        errorMsg = "you should be logged out first!"
        logError(req, errorMsg, 404)
        return res.status(404).send(errorMsg)
    }
})

app.get("/logout", async (req, res) => {
    let errorMsg = ""
    if (req.session.user) {
        const log = new Log({
            username: req.session.user.username,
            activity: "logout"
        })

        try {
            req.session.destroy()
            await log.save()
            return res.status(200).send("successfully logged out!")
        } catch (error) {
            logError(req, error.message, 500)
            return res.status(500).send(error.message)
        }
    }

    errorMsg = "you should be logged in first!"
    logError(req, errorMsg, 404)
    return res.status(404).send(errorMsg)
})

app.get("/logs", async (req, res) => {
    let errorMsg = ""
    if (req.session.user) {
        if (req.session.user.username == "admin") {
            Log.find({}, async function(err, logs) {
                if (err) {
                    logError(req, err.message, 500)
                    return res.status(500).send(err.message)
                }

                if (!logs.length) {
                    return res.status(200).send("no logs to display yet!")
                }

                return res.send(logs)
            })
        }
        else {
            errorMsg = "not authorized to see logs!"
            logError(req, errorMsg, 404)
            return res.status(404).send(errorMsg)
        }
    }
    else {
        errorMsg = "admin login needed!"
        logError(req, errorMsg, 404)
        return res.status(404).send(errorMsg)
    }
})

function logError (req, msg, code) {
    logger.error(`${code} - ${msg} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
}

module.exports = app