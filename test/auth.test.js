const mongoose = require("mongoose")
const createServer = require("../server/server")
const User = require("../models/user")
const supertest = require("supertest");

const user = {
    username: "test",
    password: "test"
}

beforeEach((done) => {
    mongoose.connect(
        "mongodb://localhost:27017/messaging_service",
        { useNewUrlParser: true },
        () => done()
    )
})

afterEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
        mongoose.connection.close(() => done())
    })
})

const app = createServer()

test("POST /register", async () => {
    const data = {
        username: "user",
        password: "password",
    }

    await supertest(app)
        .post("/auth/register")
        .send(data)
        .expect(200)
        .then(async (response) => {
            expect(response.body._id).toBeTruthy()
            expect(response.body.username).toBe(data.username)
            expect(response.body.password).toBe(data.password)

            const user = await User.findOne({ _id: response.body._id })
            expect(user).toBeTruthy()
            expect(user.username).toBe(data.username)
            expect(user.password).toBe(data.password)
        })
})

test("POST /login", async () => {
    const data = user
    const registered = await User.create(user)

    await supertest(app)
        .post("/auth/login")
        .send(data)
        .expect(200)
        .then(async (response) => {
            expect(response.body._id).toBeTruthy()
            expect(response.body.username).toBe(data.username)
            expect(response.body.password).toBe(data.password)

            const user = await User.findOne({ _id: response.body._id })
            expect(user).toBeTruthy()
            expect(user.username).toBe(data.username)
            expect(user.password).toBe(data.password)
        })
})



