# Armut Messaging Service

This project is a simple messaging service.

- Used technologies: Node.js, Express.js, MongoDB (NoSQL), Docker

- I had really little experience with Node.js before, and I have never used Express.js, Mongoose, Docker and Supertest (for unit testing). This project helped me to take a glance to a backender's lifestyle and what they go through in the work life.

- Although it took me some time to comprehend integrating these technologies, I had too much of fun and satisfaction while trying to achieve my goal.

- I used Postman to send requests.

## Requirements

Scenario

- Users can register and login to the system.

- Users can send messages to each other if they know others' usernames.

- Users can access their previous chats.

- Users can block each other.

- Activity logs are held in a MongoDB collection.

- Error logs are held in the error.log file.


Technical Requirements

- The service is scalable since I used MongoDB for the database connection.

- The service is Dockerized, it can be run through docker-compose build, then docker-compose up

- The unit test coverage is 29.46% since I couldn't cover authorized requests even though I spent about a day or two trying to deal with it.

## Endpoints

### /register (POST)
A new user can register through this endpoint. 
The request body should be: <br />
{ <br />
  username: "*username*", <br />
  password: "*password*" <br />
}


### /login (POST)
A registered user can be logged in through this endpoint. <br />
The request body should be: <br />
{ <br />
  username: "*username*", <br />
  password: "*password*" <br />
}


### /logout (DELETE)
The logged in user can log out through this endpoint.


### /log (GET)
Retrieves the user activity logs for all users. Only the account with the username *"admin"* can access the logs.


### /send_message/:username (POST)
A user can send a message to another user with the username in the request parameter. <br />
The request body should be: <br />
{ <br />
    "content": "*message*" <br />
}


### /messages/:username (GET)
A user can see the previous messages with the user having the username in the request parameter.


### /block/:username (POST)
The current user can block the user having the username in the request parameter.


### /unblock/:username (DELETE)
The current user can unblock the user having the username in the request parameter.
