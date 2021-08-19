const express = require("express")
const User = require("../models/user")
const Log = require("../models/log")
const app = express()

app.post("/register", async (req, res) => {
    if (!req.session.user) {
        if (req.body.username == "" || req.body.password == "") {
            return res.status(404).send("enter valid credentials!")
        }

        User.findOne({username: req.body.username}, async function(err, user) {
            if (user) {
                return res.status(404).send("this user already exists!")
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
                    return res.status(500).send(error)
                }
            }
        })
    }
    else {
        return res.status(404).send("a user is logged in right now! log out first!")
    }
})

app.post("/login", async (req, res) => {
    if (!req.session.user) {
        const username = req.body.username
        const password = req.body.password

        User.findOne({
                username: username
            },
            async function (err, user) {
                if (err) {
                    return res.status(500).send(err.message)
                }

                if (!user) {
                    return res.status(404).send("incorrect credentials!")
                }

                if (password.localeCompare(user.password)) {
                    const log = new Log({
                        username: username,
                        activity: "invalid login"
                    })

                    try {
                        await log.save()
                        return res.status(404).send("incorrect credentials!")
                    } catch (error) {
                        return res.status(500).send(error)
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
                    return res.status(500).send(error)
                }

            }
        )
    }
    else {
        return res.status(404).send("you should be logged out first!")
    }
})

app.get("/logout", async (req, res) => {
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
            return res.status(500).send()
        }

    }

    return res.status(404).send("you should be logged in first!")
})

module.exports = app