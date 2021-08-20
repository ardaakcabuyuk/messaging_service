const express = require("express")
const Message = require("../models/message")
const User = require("../models/user")
const Blocked = require("../models/blocked")
const Log = require("../models/log")
const logger = require('../utils/logger');

const app = express()

app.post("/send_message/:to", async (req, res) => {
    let errorMsg = ""
    try {
        if (req.session.user) {
            const to = req.params.to
            const from = req.session.user.username
            User.findOne({
                username: to
            }, async function (err, user) {
                if (err) {
                    logError(req, err.message, 500)
                    return res.status(500).send()
                }
                if (!user) {
                    errorMsg = "user " + to + " does not exist"
                    logError(req, errorMsg, 404)
                    return res.status(404).send(errorMsg)
                }

                Blocked.findOne({
                    $or: [{$and: [{blocked: to}, {by: from}]}, {$and: [{blocked: from}, {by: to}]}]
                }, async function (err, block) {
                    if (!block) {
                        const content = req.body.content

                        const message = new Message({
                            from: from,
                            to: to,
                            content: content
                        })

                        const log = new Log({
                            username: from,
                            activity: "sent message to " + to,
                        })

                        try {
                            await message.save()
                            await log.save()
                            return res.send(message)
                        } catch (error) {
                            logError(req, error.message, 500)
                            return res.status(500).send(error)
                        }
                    } else {
                        errorMsg = block.by + " blocked " + block.blocked + "!"
                        logError(req, errorMsg, 404)
                        return res.status(404).send(errorMsg)
                    }
                })
            })
        }
        else {
            errorMsg = "you should be logged in first!"
            logError(req, errorMsg, 404)
            return res.status(404).send(errorMsg)
        }

    } catch (error) {
        logError(req, error.message, 500)
        res.status(500).send(error.message)
    }
})

app.get("/messages/:username", async (req, res) => {
    let errorMsg = ""
    try {
        if (req.session.user) {
            User.findOne({
                username: req.params.username
            }, async function (err, user) {
                if (err) {
                    logError(req, err.message, 500)
                    return res.status(500).send(err)
                }

                if (!user) {
                    errorMsg = "user " + req.params.username + " does not exist!"
                    logError(req, errorMsg, 404)
                    return res.status(404).send(errorMsg)
                }

                Message.find({
                    $or: [
                        {$and: [{from: req.session.user.username}, {to: req.params.username}]},
                        {$and: [{from: req.params.username}, {to: req.session.user.username}]}
                    ]
                }, async function (err, messages) {
                    if (err) {
                        logError(req, err.message, 500)
                        return res.status(500).send(err.message)
                    }

                    if (!messages.length) {
                        return res.status(200).send("no messages!")
                    }

                    const log = new Log({
                        username: req.session.user.username,
                        activity: "viewed messages with " + req.params.username,
                    })

                    try {
                        await log.save()
                        res.send(messages)
                    } catch (error) {
                        logError(req, error.message, 500)
                        return res.status(500).send(error.message)
                    }
                })
            })
        }
        else {
            errorMsg = "you should be logged in first!"
            logError(req, errorMsg, 404)
            return res.status(404).send(errorMsg)
        }

    } catch (error) {
        logError(req, error.message, 500)
        res.status(500).send(error.message)
    }
})

app.post("/block/:username", async (req, res) => {
    let errorMsg = ""
    try {
        if (req.session.user) {
            User.findOne({
                username: req.params.username
            }, async function (err, user) {
                if (err) {
                    logError(req, err.message, 500)
                    return res.status(500).send(err.message)
                }

                if (!user) {
                    errorMsg = "user " + req.params.username + " does not exist!"
                    logError(req, errorMsg, 404)
                    return res.status(404).send(errorMsg)
                }

                Blocked.findOne({
                    $or: [
                        {$and: [{blocked: req.session.user.username}, {by: req.params.username}]},
                        {$and: [{blocked: req.params.username}, {by: req.session.user.username}]}
                    ]
                }, async function (err, blocked) {
                    if (err) {
                        logError(req, err.message, 500)
                        return res.status(500).send(err.message)
                    }

                    if (!blocked) {
                        const block = new Blocked({
                            blocked: req.params.username,
                            by: req.session.user.username
                        })

                        const log = new Log({
                            username: req.session.user.username,
                            activity: "blocked " + req.params.username,
                        })

                        try {
                            await block.save()
                            await log.save()
                            return res.status(200).send("you successfully blocked " + req.params.username)
                        } catch (error) {
                            logError(req, error.message, 500)
                            return res.status(500).send(error.message)
                        }
                    }

                    errorMsg = "there is already a block between you and " + req.params.username + "!"
                    logError(req, errorMsg, 404)
                    return res.status(404).send(errorMsg)
                })
            })
        }
        else {
            errorMsg = "you should be logged in first!"
            logError(req, errorMsg, 404)
            return res.status(404).send(errorMsg)
        }
    } catch (error) {
        logError(req, error.message, 500)
        res.status(500).send(error.message)
    }
})

app.delete("/unblock/:username", async (req, res) => {
    let errorMsg = ""
    try {
        if (req.session.user) {
            User.findOne({
                username: req.params.username
            }, async function (err, user) {
                if (err) {
                    logError(req, err.message, 500)
                    return res.status(500).send(err.message)
                }

                if (!user) {
                    errorMsg = "user " + req.params.username + " does not exist!"
                    logError(req, errorMsg, 404)
                    return res.status(404).send(errorMsg)
                }

                Blocked.deleteOne({
                    $and: [{blocked: req.params.username}, {by: req.session.user.username}]
                }, async function (err, result) {
                    if (err) {
                        logError(req, err.message, 500)
                        return res.status(500).send(err.message)
                    }

                    if (result.deletedCount) {
                        const log = new Log({
                            username: req.session.user.username,
                            activity: "unblocked " + req.params.username,
                        })

                        try {
                            await log.save()
                            return res.status(200).send("you successfully unblocked " + req.params.username)
                        } catch (error) {
                            logError(req, error.message, 500)
                            return res.status(500).send(error)
                        }
                    }

                    errorMsg = req.params.username + " is not blocked!"
                    logError(req, errorMsg, 404)
                    return res.status(404).send(errorMsg)
                })
            })
        }
        else {
            errorMsg = "you should be logged in first!"
            logError(req, errorMsg, 404)
            return res.status(404).send(errorMsg)
        }
    } catch (error) {
        logError(req, error.message, 500)
        res.status(500).send(error.message)
    }
})

function logError (req, msg, code) {
    logger.error(`${code} - ${msg} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
}

module.exports = app