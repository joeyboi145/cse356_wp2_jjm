#!/bin/bash

# Once you've cloned the repository: 
# git clone https://github.com/joeyboi145/cse356_wp2_jjm.git

# 1. Install node.js
# 2. Install node.js dependences
#   - express
#   - mongoose
#   - nodemailer
#   - nodemailer-smtp-transport
# 3. Install mongoDB
# 4. Install & configure Postfix
# 5. Install Docker
# 6. Start Webserver Container


# Install Node.js
sudo apt install -y nodejs

# Install node.js dependences
cd application
npm install express
npm install mongoose
npm install nodemailer
npm install nodemailer-smtp-transport
cd ..

# Install mongoDB
sudo apt-get install gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Install postfix
sudo apt install postfix
sudo systemctl reload postfix

# Install Docker
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Webserver Container
docker build -t test-server test-web-server
docker run --rm -d -p 80:80 test-server

# Remaining Manual Steps
#5. Change Server IP encoding in index.js
#6. Start Application Server