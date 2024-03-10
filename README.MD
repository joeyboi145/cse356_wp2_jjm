#  CSE 356 Warm-up Project 2: Node.js implementation

## I've created the server in the **application** directory.  

An **Express** server that provides user verification system and serves a login and home page. The home page displays a multi-resolution immage

Run with the following command: `node server.js`

All users are stored in a local MongoDB database called **wp2** in a collection called **Users**. This is done throught the **mongoose** library. Sessions are stored in MongoDB under the **session** colletcion

The following endpoints have been implemented:
- USE /addusers
- GET /verify
- USE /login
- USE /logout
- GET /tiles/l$LAYER/$V/$H.jpg

