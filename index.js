// Application Server

const express = require('express')
// const session = require("express-session")
// const MongoDBSession = require('connect-mongodb-session')(session)
const mongoose = require('mongoose')
const mongoDB = 'mongodb://127.0.0.1:27017/wp2'
const port = 8000

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// const store = new MongoDBSession({
//     uri: mongoDB,
//     collection: 'sessions'
// })

const app = express();
app.use(express.json())

// app.use(
//     session({
//       name: 'session_name',
//       secret: "supersecret difficult to guess string",
//       cookie: {},
//       resave: false,
//       saveUninitialized: false,
//       store: store
//     })
// )


const User = require('./models/users')

// ***=== POST Requests ===***
// '/adduser'
// '/verify'
// '/login'
// '/logout'

app.post('/adduser', (req, res) => {
    const { username, password, email } = req.body;
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');

    User.findOne({ email })
    .then(user => {
        res.status(400);
        res.send("ERROR: duplicate email. Email must be unique")
    }).catch(err => console.log(err));


    User.findOne({ username })
    .then(user => {
        res.status(400);
        res.send("ERROR: duplicate username. Username must be unique")
    }).catch(err => console.log(err));


    verify_key = parseInt(Math.random() * (999999 - 100000) + 100000);
    let user = new User({
        username,
        password,
        email,
        verify_key
    });
    
    user.save()
    .then(() => {
        console.log("NEW USER");
        res.status(200)
        res.send("Success! Please verify")
    }).catch(err => console.log(err))
});

app.post('/verify', (req, res) => {
    const { email, key } = req.body;

    User.findOne({ email })
    .then(user => {
        let verify_key = user.get("verify_key")
        if (verify_key != key) {
            res.status(400);
            res.send("ERROR: Incorrect verification key")
        } else {
            User.findOneAndReplace({ email }, { verify: true })
            .then(() => {
                res.status(200)
                res.send("Verified!")
            })
            .catch(err => console.log(err))
        }
    })
});

const server = app.listen(port, () => {
    console.log(`app listening on port ${port}\n`)
  })

process.on('SIGINT', () => {
    if (db) {
      db.close()
        .then(() => {
          server.close(() => console.log("Server closed. Database instance disconnected"))
        })
        .catch((err) => console.log(err))
    }
  })