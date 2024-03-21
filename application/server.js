// Application Server: multi-resolution-user-server

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jimp = require('jimp');
var MongoDBStore = require('connect-mongodb-session')(session);

// If you pass a '-ip' flag, verification requests are sent to the current machine IP
let userArgs = process.argv
let domain = ""
if (userArgs.length == 3 && userArgs[2] == "-ip") domain = "127.0.0.1";
else domain = 'jrgroup.cse356.compas.cs.stonybrook.edu';

const mongoDB = 'mongodb://127.0.0.1:27017/wp2';
const port = 80;

mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var store = new MongoDBStore({
    uri: 'mongodb://127.0.0.1:27017/wp2',
    collection: 'sessions'
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    session({
        secret: "wp2 supersecret string",
        cookie: {
            name: 'token',
            domain: domain,
            maxAge: 24 * 60 * 60 * 1000
        },
        resave: false,
        saveUninitialized: false,
        store: store
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
        let transporter =  nodemailer.createTransport({
            service: 'postfix',
            host: 'cse356.compas.cs.stonybrook.edu',
            port: 25,
            secure: false,
            tls:{
                rejectUnauthorized: false
            }
        });

        let email_urlencoded = encodeURIComponent(email)
        let link = `http://${domain}/verify?email=${email_urlencoded}&key=${verification_key}`

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

app.use('/adduser', async (req, res) => {
    let username = null;
    let password = null;
    let email = null;

    if (req.method == 'GET') {
        username = req.query.username;
        password = req.query.password;
        email = req.query.email;
    } else if (req.method == 'POST'){
        username = req.body.username;
        password = req.body.password;
        email = req.body.email;
    }

    console.log(`\'/adduser\' POST request `);
    console.log(`{ ${username}, ${password}, ${email}}`)
    res.setHeader('content-type', 'application/json');
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');
    let user = null;

    try {
        user = await User.findOne({ email });
        if (user != null){
            console.log("ERROR: Duplicate email\n")
            return res.status(200).json({status: "ERROR", message: "Duplicate email. Email must be unique"});
        }
        user = await User.findOne({ username })
        if (user != null){
            console.log("ERROR: Duplicate username\n");
            return res.status(200).json({status: "ERROR", message: "Duplicate username. Username must be unique."});
        }

        let verify_key = parseInt(Math.random() * (999999 - 100000) + 100000);
        user = new User({
            username,
            password,
            email,
            verify_key
        });
    
        await user.save();
        console.log(`NEW USER: ${username}, VERIFICATION: ${verify_key}`);
        let email_sent = await send_verification_email(email, verify_key);
        if (email_sent){
            console.log("Verification Email sent!\n")
            return res.status(200).json({status: "OK", data: { email: email, message: "Successfully send the mail" }});
        } else {
            console.log("ERROR: Verification Email not sent!\n")
            return res.status(200).json({ status: 'ERROR', message: "Email not successfully sent" });
        }
    } catch (err) { 
        console.log(err);
        return res.status(500).json({status: "ERROR", message: "Server Error"})
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
                console.log("ERROR: Already Verified\n");
                return res.status(200).json({status: "ERROR", message: "User already verified"})
            } else if (verify_key != key) {
                console.log("ERROR: Incorrect Key\n")
                return res.status(200).json({status: "ERROR", message: "Incorrect verification key"})
            } else {
                await User.updateOne({ email } , { verify: true });
                console.log("USER VERFIED!\n");
                return res.status(200).json({status: "OK", message: "Verified"});
            }
        } else {
            console.log("ERROR: User not found\n");
            return res.status(200).json({status: "ERROR", message: "User not found"})
        }
    } catch (err) { 
        console.log(err); 
        return res.status(500).json({status: "ERROR", message: "Server Error"})
    }
});

app.use('/login', async (req,res) => { 
    let username = null;
    let password = null;

    if (req.method == 'GET') {
        username = req.query.username;
        password = req.query.password;
    } else if (req.method == 'POST'){
        console.log(req.body)
        username = req.body.username;
        password = req.body.password;
    }

    console.log(`\'/login\' GET request `);
    console.log(`{ ${username}, ${password} }`);
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');
    let user = null;
    try {
        user = await User.findOne({$and: [{ username }, { password }]});
        if (user == null){
            console.log("ERROR: Invalid Credentials\n")
            return res.status(400).json({status: "ERROR", message: "Invalid credentials"});
        } 
            
        let verified = user.get("verify");
        if (!verified) {
            console.log("ERROR: User not verified\n");
            return res.status(400).json({status: "ERROR", message: "User not verified"});
        }
        
        req.session.username = username;
        if (!req.session.login) {
            console.log("New login!");
            req.session.save()
        } else {
            console.log("Already logged in!");
        }

        req.session.login = true;
        console.log(`Session: { username: ${req.session.username}, login: ${req.session.login}}`)
        res.status(200).send({status: 'OK', message: "Logged in"})

    } catch (err) { 
        console.log(err);
        return res.status(500).json({status: "ERROR", message: "Server Error"})
    }
});

app.get('/', (req, res) => {
    console.log(`\'/\' GET request `);

    if (req.session.login) {
        console.log(`Session: { username: ${req.session.username}, login: ${req.session.login}}`)
        console.log("Serving HTML\n");
        return res.status(200).sendFile('home.html', {root: __dirname + '/html/'} ); 
    } else  {
        console.log("Session: {}")
        console.log("Logged Out, can't server HTML\n");
        return res.status(200).sendFile('login.html', {root: __dirname + '/html/'} ); 
    }
})

app.use('/logout', async (req,res) => {
    console.log(`\'/logout\' request `);
    res.setHeader('content-type', 'application/json');
    res.append('X-CSE356', '65b99885c9f3cb0d090f2059');
    if (req.session.login){
        console.log(`Session: { username: ${req.session.username}, login: ${req.session.login}}`)
        req.session.destroy()
        console.log("Successfully Logged Out!\n")
        res.status(200).send({status: "OK", message: "Successfully Logged Out"});
    } else {
        console.log("Session: {}")
        console.log("ERROR: Can't log out. No session present\n")
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
        if (!req.session.login) {
            console.log("Session: {}")
            console.log("Logged Out, can't server pictures\n");
            res.setHeader('content-type', 'application/json');
            return res.status(400).json({status: "ERROR", message: "Logged out"});
        } else {
            console.log(`Session: { username: ${req.session.username}, login: ${req.session.login}}`)
        }
        
        if (style == 'bw'){
            const image = await jimp.read(filepath)
            const grey_image = image.grayscale();
            const buffer = await grey_image.getBufferAsync(jimp.MIME_JPEG)
            res.status(200).send(Buffer.from(buffer, 'binary'))
            console.log(`Sending in black and white: ${filepath}\n`);
        } else {
            res.status(200).sendFile(filepath, {root: __dirname + '/'} ); 
            console.log(`Sending in color: ${filepath}\n`);
        }
    } catch (err) {
        console.log(err)
        console.log();
        res.setHeader('content-type', 'application/json');
        return res.status(500).json({status: "ERROR", message: "Server Error"});
    }
});

const server = app.listen(port, () => {
    console.log(`\napp listening on port ${port}\n`)
});

process.on('SIGINT', () => {
    if (db) {
      db.close()
        .then(() => {
          server.close(() => console.log("\nServer closed. Database instance disconnected\n"))
          process.exit(0);
        })
        .catch((err) => console.log(err))
    }
});