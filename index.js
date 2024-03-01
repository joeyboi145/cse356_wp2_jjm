// Application Server

const express = require('express')
// const session = require("express-session")
// const MongoDBSession = require('connect-mongodb-session')(session)
const mongoose = require('mongoose')
const mongoDB = 'mongodb://127.0.0.1:27017/wp2'
const port = 8000

mongoose.connect(mongoDB)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// const store = new MongoDBSession({
//     uri: mongoDB,
//     collection: 'sessions'
// })

const app = express();
app.use(express.urlencoded({ extended: true }))

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
    console.log(req.body);
    const { username, password, email } = req.body;
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');
    let user = null;
    
    try {
        user = await User.findOne({ email });
        if (user != null){
            res.status(400);
            res.send("ERROR: duplicate email. Email must be unique");
            return;
        }

        user = await User.findOne({ username })
        if (user != null){
            res.status(400);
            res.send("ERROR: duplicate email. Email must be unique");
            return;
        }

        let verify_key = parseInt(Math.random() * (999999 - 100000) + 100000);
        user = new User({
            username,
            password,
            email,
            verify_key
        });
    
        await user.save();
        console.log(`NEW USER: ${username}`);
        console.log(`VERIFICATION CODE: ${verify_key}\n`);
        res.status(200);
        res.send("Success! Please verify");
    } catch (err) { 
        console.log(err)
        res.status(500);
        res.send("Server Error") ;
    }
});

app.post('/verify', async (req, res) => {
    const { email, key } = req.body;
    try {
        let user = User.findOne({ email })
        if (user != null){
            let verify_key = user.get("verify_key");
            if (verify_key != key) {
                res.status(400);
                res.send("ERROR: Incorrect verification key");
            } else {
                await User.findOneAndReplace({ email }, { verify: true });
                res.status(200);
                res.send("Verified!");
            }
        } else {
            res.status(400);
            res.send("ERROR: User not found");
        }
    } catch (err) { console.log(err); }
});

const server = app.listen(port, () => {
    console.log(`\napp listening on port ${port}\n`)
  })

process.on('SIGINT', () => {
    if (db) {
      db.close()
        .then(() => {
          server.close(() => console.log("\nServer closed. Database instance disconnected\n"))
        })
        .catch((err) => console.log(err))
    }
  })