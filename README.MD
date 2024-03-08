# Warm-up Project Node.js possible implementation

## I've created the user-verification server in the **application** directory.  

An **Express** server that provides user verification system.

Run with the following command: `node index.js`

All users are stored in a local MongoDB database called **wp2** in a collection called **Users**. This is done throught the **mongoose** library.

The following endpoints have been implemented:
- POST /addusers
- GET /verify
- USE /login
- USE /logout
- GET /tiles/l$LAYER/$V/$H.jpg

