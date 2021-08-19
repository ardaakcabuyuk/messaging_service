const express = require("express")
const Message = require("../models/message")
const User = require("../models/user")
const Blocked = require("../models/blocked")
const Log = require("../models/log")

const app = express()

app.post("/send_message/:to", async (req, res) => {
    try {
        if (req.session.user) {
            const to = req.params.to
            const from = req.session.user.username
            User.findOne({
                username: to
            }, async function (err, user) {
                if (err) {
                    console.log(err)
                    return res.status(500).send()
                }
                if (!user) {
                    return res.status(404).send("user " + to + " does not exist")
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
                            return res.status(500).send(error)
                        }
                    } else {
                        return res.status(404).send(block.by + " blocked " + block.blocked + "!")
                    }
                })
            })
        }
        else {
            return res.status(404).send("you should be logged in first!")
        }

    } catch (error) {
        res.status(500).send(error)
    }
})

app.get("/messages/:username", async (req, res) => {
    try {
        if (req.session.user) {
            User.findOne({
                username: req.params.username
            }, async function (err, user) {
                if (err) {
                    return res.status(500).send(err)
                }

                if (!user) {
                    return res.status(404).send("user " + req.params.username + " does not exist!")
                }

                Message.find({
                    $or: [
                        {$and: [{from: req.session.user.username}, {to: req.params.username}]},
                        {$and: [{from: req.params.username}, {to: req.session.user.username}]}
                    ]
                }, async function (err, messages) {
                    if (err) {
                        return res.status(500).send(err)
                    }

                    if (!messages.length) {
                        return res.status(404).send("no messages!")
                    }

                    const log = new Log({
                        username: req.session.user.username,
                        activity: "viewed messages with " + req.params.username,
                    })

                    try {
                        await log.save()
                        res.send(messages)
                    } catch (error) {
                        return res.status(500).send(error)
                    }
                })
            })
        }
        else {
            return res.status(404).send("you should be logged in first!")
        }

    } catch (error) {
        res.status(500).send(error)
    }
})

app.post("/block/:username", async (req, res) => {
    try {
        if (req.session.user) {
            User.findOne({
                username: req.params.username
            }, async function (err, user) {
                if (err) {
                    return res.status(500).send(err)
                }

                if (!user) {
                    return res.status(404).send("user " + req.params.username + " does not exist!")
                }

                Blocked.findOne({
                    $or: [
                        {$and: [{blocked: req.session.user.username}, {by: req.params.username}]},
                        {$and: [{blocked: req.params.username}, {by: req.session.user.username}]}
                    ]
                }, async function (err, blocked) {
                    if (err) {
                        return res.status(500).send(err)
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
                            return res.status(500).send(error)
                        }
                    }

                    return res.status(404).send("there is already a block between you and " + req.params.username + "!")
                })
            })
        }
        else {
            return res.status(404).send("you should be logged in first!")
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

app.delete("/unblock/:username", async (req, res) => {
    try {
        if (req.session.user) {
            User.findOne({
                username: req.params.username
            }, async function (err, user) {
                if (err) {
                    return res.status(500).send(err)
                }

                if (!user) {
                    return res.status(404).send("user " + req.params.username + " does not exist!")
                }

                Blocked.deleteOne({
                    $and: [{blocked: req.params.username}, {by: req.session.user.username}]
                }, async function (err, result) {
                    if (err) {
                        return res.status(500).send(err)
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
                            return res.status(500).send(error)
                        }
                    }

                    return res.status(404).send(req.params.username + " is not blocked!")
                })
            })
        }
        else {
            return res.status(404).send("you should be logged in first!")
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = app