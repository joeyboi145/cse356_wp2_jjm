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

app.post('/adduser', async (req, res) => {
    const { username, password, email } = req.body;

    let user = await User.findOne({ email: email });
    if (user) {
        // FIX: Write duplicate email error response
        return
    }

    user = await User.findOne({ username: username });
    if (user) {
        // FIX: Write duplicate usernmane error response
        return
    }

    verify_key = parseInt(Math.random() * (999999));
    user = new User({
        username,
        password,
        email,
        verify_key
    });
    
    await user.save();
    console.log("NEW USER");
    // FIX: Write successs response
});

app.post('/verify', async (req, res) => {
    const { email, key } = req.body;

    let user = await User.findOne({ email });
    if (!user){
        // FIX: Write user not found error response
    } else if (user.verify_key != key) {
        // FIX: Write incorrect key error reponse
    }

    // FIX: Update record to be varified
    // FIX: Write success response
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