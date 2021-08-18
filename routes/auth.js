const express = require("express")
const User = require("../models/user")
const app = express()

app.post("/register", async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
})

app.post("/login", async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    User.findOne({
        username: username,
        password: password
        },
        function (err, user) {
            if (err) {
                console.log(err)
                return res.status(500).send()
            }

            if (!user) {
                return res.status(404).send()
            }

            req.session.user = user
            return res.status(200).send()
        }
    )
})

app.get("/index", function(req, res) {
    if (!req.session.user) {
        return res.status(401).send()
    }

    return res.status(200).send("logged in")
})

app.get("/logout", function(req, res) {
    req.session.destroy()
    res.status(200).send()
})

module.exports = app;