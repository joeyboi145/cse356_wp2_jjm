## Main Application Server

**Express** server that provides user verification system. Email procedure of verification is not implemented yet, but the user verification code is printed in the terminal. Sessions have not been implemented, but I have some boiler code commented out for it.

Run with the following command: `node index.js`

All users are stored in a local MongoDB database called **wp2** in a collection called **Users**. This is done throught the **mongoose** library.



