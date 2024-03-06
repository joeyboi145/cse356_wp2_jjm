## Main Application Server

**Express** server that provides user verification system. Email procedure of verification is not been fully tested yet, but the user verification code is printed in the terminal. Sessions have not been fully implemented yet

Run with the following command: `node index.js`

All users are stored in a local MongoDB database called **wp2** in a collection called **Users**. This is done throught the **mongoose** library.



