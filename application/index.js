// Application Server

let userArgs = process.argv.slice(2);

if (userArgs.length !== 1) {
    console.log('ERROR: Incorrect number of arguments')
    console.log('Please include Server IP Address')
    return
}

const express = require('express');
const session = require("express-session");
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const mongoDB = 'mongodb://127.0.0.1:27017/wp2';
const serverIP = userArgs[0];
const pass = 'HealthyKermit!69';
const port = 8000;

console.log(`Pass: ${pass}`);

mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        genid: function(req) {
            return genuuid();
        },
        secret: "wp2 supersecret string",
        cookie: {},
        resave: false,
        saveUninitialized: true,
    })
)


const User = require('./models/users')

// ***=== POST Requests ===***
// '/adduser'
// '/verify'
// '/login'
// '/logout'


async function send_verification_email(email, verification_key){
    let transporter =  nodemailer.createTransport(smtpTransport({
        service: 'postfix',
        host: 'cse356.compas.cs.stonybrook.edu',
        port: 25,
        secure: false,
        auth: {
            user: 'joey@cse356.compas.cs.stonybrook.edu',
            pass: pass
        },
        tls:{
            rejectUnauthorized: false
        }
    }));

    let email_urlencoded = encodeURIComponent(email)
    let link = `http://${serverIP}:${port}/${email_urlencoded}/${verification_key}`

    let mailOptions = {
        from: 'joey@cse356.compas.cs.stonybrook.edu',
        to: email,
        subject: 'Verfication Code Email',
        text: 'Your Verification Code:' + verification_key + '\nOr click here:\n' + link
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            return false;
        } else return true;
    });
}

app.post('/adduser', async (req, res) => {
    const { username, password, email } = req.body;
    console.log(`\'/adduser\' POST request `);
    console.log(`{ ${username}, ${password}, ${email}}`)
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');
    let user = null;

    try {
        user = await User.find({ email });
        if (user != null){
            return res.status(400).send({status: "ERROR", message: "Duplicate email. Email must be unique"});
        }
        user = await User.findOne({ username })
        if (user != null){
            return res.status(400).send({status: "ERROR", message: "Duplicate username. Username must be unique."});
        }

        let verify_key = parseInt(Math.random() * (999999 - 100000) + 100000);
        user = new User({
            username,
            password,
            email,
            verify_key
        });
    
        await user.save();
        console.log(`NEW USER: ${username}, Verification: ${verify_key}`);
        let email_sent = await send_verification_email(email, verify_key)
        if (email_sent){
            console.log("Verification Email sent!\n")
            return res.status(200).send({status: "OK", data: { email: email, message: "Successfully send the mail" }});
        } else {
            return res.status(400).send({ status: 'ERROR', message: "Email not successfully sent" });
        }
    } catch (err) { 
        console.log(err);
        return res.status(500).send({status: "ERROR", message: "Server Error"})
    }
});

app.get('/verify', async (req, res) => {
    console.log("'/verify' GET request")
    let email = req.query.email
    let key = req.query.key
    console.log(`{${email}, ${key}}`)
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');

    try {
        let user = await User.findOne({ email })
        if (user != null){
            let verified = user.get("verify")
            let verify_key = user.get("verify_key");
            if (verified){
                return res.status(400).send({status: "ERROR", message: "User already verified"})
            } else if (verify_key != key) {
                return res.status(400).send({status: "ERROR", message: "Incorrect verification key"})
            } else {
                await User.updateOne({ email } , { verify: true });
                console.log("USER VERFIED\n");
                return res.status(200).send({status: "OK", message: "Verified"});
            }
        } else {
            return res.status(400).send({status: "ERROR", message: "User not found"})
        }
    } catch (err) { 
        console.log(err); 
        return res.status(500).send({status: "ERROR", message: "Server Error"})
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`\'/login\' POST request `);
    console.log(`{ ${username}, ${password} }`);
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');
    let user = null;

    try {
        user = await User.findOne({$and: [{ email }, { password }]});
        if (user != null){
            return res.status(400).send({status: "ERROR", message: "Invalid credentials"});
        } 
        
        let verified = user.get("verify");
        if (!verified) {
            return res.status(400).send({status: "ERROR", message: "User not verified"});
        }
        
        req.session.username = user.get("username");
        if (!req.session.login) {
            req.session.login = true;
            // req.session.level = 1;
            // req.session.vertical = 1;
            // req.session.horizontal = 1;
        }

        // FIX: Return HTML file
        // This HTML File will fetch the correct tile


    } catch (err) { 
        console.log(err);
        return res.status(500).send({status: "ERROR", message: "Server Error"})
    }
});

app.post('/logout', async (req,res) => {
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');
    if (req.session.login){
        req.session.destroy();
        res.status(200).send({status: "OK", message: "Successfully Logged Out"});
    } else {
        res.status(400).send({status: "ERROR", message: 'Log out failed. Not previously logged in'});
    }
});

app.get('/tiles/l:LAYER/:V/:H.jpg', async (req, res) => {
    console.log("'/tiles' GET request");
    let layer = req.params.LAYER;
    let vertical = req.params.V;
    let horizontal = req.params.H;
    let style = req.query.style;
    console.log(`{${layer}, ${vertical}, ${horizontal}, ${style}}`);
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');

    // Get file path and return image
});

const server = app.listen(port, () => {
    console.log(`\napp listening on ${serverIP} port ${port}\n`)
});

process.on('SIGINT', () => {
    if (db) {
      db.close()
        .then(() => {
          server.close(() => console.log("\nServer closed. Database instance disconnected\n"))
        })
        .catch((err) => console.log(err))
    }
});