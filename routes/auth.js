const express = require("express")
const User = require("../models/user")
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
                const user = new User(req.body);

                try {
                    await user.save()
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
                username: username,
                password: password
            },
            function (err, user) {
                if (err) {
                    return res.status(500).send(err.message)
                }

                if (!user) {
                    return res.status(404).send("incorrect credentials!")
                }

                req.session.user = user
                return res.status(200).send("successfully logged in!")
            }
        )
    }
    else {
        return res.status(404).send("you should be logged out first!")
    }
})

app.get("/logout", function(req, res) {
    if (req.session.user) {
        req.session.destroy()
        return res.status(200).send("successfully logged out!")
    }

    return res.status(404).send("you should be logged in first!")
})

module.exports = app;