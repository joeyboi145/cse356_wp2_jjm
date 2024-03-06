// Application Server

// Ignore: Used for changing server IP, take in as argument
// let userArgs = process.argv.slice(2);

// if (userArgs.length !== 1) {
//     console.log('ERROR: Incorrect number of arguments')
//     console.log('Please include Server IP Address')
//     return
// }

const express = require('express');
const session = require("express-session");
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const jimp = require('jimp');
const mongoDB = 'mongodb://127.0.0.1:27017/wp2';
const serverIP = '209.151.148.61';
const port = 80;

mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "wp2 supersecret string",
        cookie: {},
        resave: false,
        saveUninitialized: true,
    })
)

const User = require('./models/users');

async function send_verification_email(email, verification_key){
    // In /etc/postfix/main.cf:
    // ...
    // mydestination = joey.cse356.compas.cs.stonybrook.edu, joey.cse356.compas.cs.stonybrook.edu, localhost.c>
    // relayhost = cse356.compas.cs.stonybrook.edu
    // ...
    //
    return new Promise((resolve, reject) => {
        let transporter =  nodemailer.createTransport(smtpTransport({
            service: 'postfix',
            host: 'cse356.compas.cs.stonybrook.edu',
            port: 25,
            secure: false,
            tls:{
                rejectUnauthorized: false
            }
        }));

        let email_urlencoded = encodeURIComponent(email)
        let link = `http://${serverIP}/verify?email=${email_urlencoded}&key=${verification_key}`

        let mailOptions = {
            from: 'root@cse356.compas.cs.stonybrook.edu',
            to: email,
            subject: 'Verfication Code Email',
            text: 'Your Verification Code: ' + verification_key + '\nOr click here:\n' + link
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log("\nEmail ERROR: " + error);
                reject(false);
            } else {
                console.log('\nEmail OK: ' + info.response);
                resolve(true);
            }
        });
    });
}

app.post('/adduser', async (req, res) => {
    const { username, password, email } = req.body;
    console.log(`\'/adduser\' POST request `);
    console.log(`{ ${username}, ${password}, ${email}}`)
    res.setHeader('content-type', 'application/json');
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');
    let user = null;

    try {
        user = await User.findOne({ email });
        if (user != null){
            console.log("Duplicate email\n")
            return res.status(400).send({status: "ERROR", message: "Duplicate email. Email must be unique"});
        }
        user = await User.findOne({ username })
        if (user != null){
            console.log("Duplicate username\n");
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
        let email_sent = await send_verification_email(email, verify_key);
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
    let email = req.query.email;
    let key = req.query.key;
    console.log("'/verify' GET request");
    console.log(`{${email}, ${key}}`);
    res.setHeader('content-type', 'application/json');
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');

    try {
        let user = await User.findOne({ email })
        if (user != null){
            let verified = user.get("verify");
            let verify_key = user.get("verify_key");
            if (verified){
                console.log("Already Verified\n");
                return res.status(400).send({status: "ERROR", message: "User already verified"})
            } else if (verify_key != key) {
                console.log("Incorrect Key\n")
                return res.status(400).send({status: "ERROR", message: "Incorrect verification key"})
            } else {
                await User.updateOne({ email } , { verify: true });
                console.log("USER VERFIED!\n");
                return res.status(200).send({status: "OK", message: "Verified"});
            }
        } else {
            console.log("User not found\n");
            return res.status(400).send({status: "ERROR", message: "User not found"})
        }
    } catch (err) { 
        console.log(err); 
        return res.status(500).send({status: "ERROR", message: "Server Error"})
    }
});


app.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    console.log(`\'/login\' POST request `);
    console.log(`{ ${username}, ${password} }`);
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');
    let user = null;

    try {
        user = await User.findOne({$and: [{ username }, { password }]});
        if (user == null){
            console.log("Invalid Credentials\n")
            return res.status(400).send({status: "ERROR", message: "Invalid credentials"});
        } 
        
        let verified = user.get("verify");
        if (!verified) {
            console.log("User not verified\n");
            return res.status(400).send({status: "ERROR", message: "User not verified"});
        }
        
        req.session.username = username;
        if (!req.session.login) {
            console.log("New login");
            req.session.login = true;
        } else {
            console.log("already logged in");
        }
        next()
        //return res.status(200).send({status: "OK", message: "Logged in"});
        // res.setHeader('content-type', 'text/html');
        // res.status(200).render(__dirname + "/html/index"); 
        // console.log("index.html servered\n")

    } catch (err) { 
        console.log(err);
        return res.status(500).send({status: "ERROR", message: "Server Error"})
    }
});

var home_directory = __dirname + '/html'
console.log(home_directory)
app.use('/html', express.static((__dirname + "/html")))

// var options = {
//     dotfiles: 'ignore',
//     etag: false,
//     extensions: ['htm', 'html', 'css', 'js'],
//     index: true,
//     maxAge: '1d',
//     redirect: false,
// }

app.post('/logout', async (req,res) => {
    res.setHeader('content-type', 'application/json');
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');
    if (req.session.login){
        req.session.destroy();
        res.status(200).send({status: "OK", message: "Successfully Logged Out"});
    } else {
        res.status(400).send({status: "ERROR", message: 'Log out failed. Not previously logged in'});
    }
});

app.get('/tiles/l:LAYER/:V/:H.jpg', async (req, res) => {
    let filepath = req.path.slice(1);
    let style = req.query.style;
    console.log("'/tiles' GET request");
    console.log(`{ ${filepath}, ${style}}`);
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');
    res.setHeader('content-type', 'image/jpeg');

    try {
        if (style == 'color'){
            res.status(200).sendFile(filepath, {root: __dirname + '/'} ); 
            console.log(`Sent in color: ${filepath}\n`);
        } else {
            const image = await jimp.read(filepath)
            const grey_image = image.grayscale();
            const buffer = await grey_image.getBufferAsync(jimp.MIME_JPEG)
            res.status(200).send(Buffer.from(buffer, 'binary'))
            console.log(`Sent in black and white: ${filepath}\n`);
        }
    } catch (err) {
        console.log(err);
        res.setHeader('content-type', 'application/json');
        res.status(500).send({status: "ERROR", message: "Server Error"});
    }
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