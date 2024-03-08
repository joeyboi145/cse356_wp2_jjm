## Tester Static Web Server

An **NGINX** static webserver container that provides an interface to send request to the main application server

Make sure to build the docker images using `docker build -t test-server .` from inside of the directory

And run it using `docker run --rm -d -p 8080:80 test-server`

It should be accessible at **${SERVER_IP}:8080** 

It allows the following requests:
- POST /adduser
- GET /verify
- POST /login
- POST /logout


