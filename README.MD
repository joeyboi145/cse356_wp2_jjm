#  CSE 356 Warm-up Project 2: Node.js implementation

## I've created the server in the **application** directory.  

An **Express** server that provides user verification system and serves a login and home page. The home page displays a multi-resolution image.

Run with the following command: `node server.js`, which will run on the `jrgroup.cse356.compas.cs.stonybrook.edu` domain name. If you append the `-ip` flag, it will use the local domain to send verification links to.

All users are stored in a local MongoDB database called **wp2** in a collection called **Users**. This is done throught the **mongoose** library. Sessions are stored in MongoDB under the **session** collection.

The following endpoints have been implemented:
- USE /addusers
- GET /verify
- USE /login
- USE /logout
- GET /tiles/l$LAYER/$V/$H.jpg


The `init_repo.sh` bash script automatically installs and configures all dependencies for an Ubuntu 22.04 LTS system.
