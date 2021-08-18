const express = require("express")
const Message = require("../models/message")
const User = require("../models/user")
const Blocked = require("../models/blocked")

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

                        try {
                            await message.save();
                            return res.send(message);
                        } catch (error) {
                            return res.status(500).send(error);
                        }
                    } else {
                        return res.status(404).send(block.by + " blocked " + block.blocked + "!")
                    }
                })
            })
        }

        return res.status(404).send("you should be logged in first!")

    } catch (error) {
        res.status(500).send(error)
    }
})

app.get("/messages/:username", async (req, res) => {
    try {
        if (req.session.user) {
            Message.find({
                $or: [
                    {$and: [{from: req.session.user.username}, {to: req.params.username}]},
                    {$and: [{from: req.params.username}, {to: req.session.user.username}]}
                ]
            }, function (err, messages) {
                if (err) {
                    return res.status(500).send(err)
                }

                if (!messages.length) {
                    return res.status(404).send("no messages!")
                }

                try {
                    res.send(messages)
                } catch (error) {
                    return res.status(500).send(error);
                }
            })
        }

        return res.status(404).send("you should be logged in first!")

    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = app