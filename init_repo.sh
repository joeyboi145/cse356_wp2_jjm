#!/bin/bash

# Once you've cloned the repository: 
# git clone https://github.com/joeyboi145/cse356_wp2_jjm.git

# THIS IS FOR UBUNTU 22.04
# 1. Install node.js and npm
# 2. Install node.js dependences
#   - express
#   - express-session
#   - mongoose
#   - nodemailer
#   - JIMP
# 3. Install mongoDB
# 4. Install & configure Postfix


# Install current nodejs and npm
echo -e "\n\n\nInstalling Node.js:"
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

echo -e "\n\n\nInstall NPM"
sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install v20.10.0
nvm use v20.10.0

# Install node.js dependences
echo -e "\n\n\nInstalling project dependences"
cd application
npm install express
npm install express-session
npm install mongoose
npm install nodemailer
npm install jimp
npm install connect-mongodb-session
cd ..

# Install mongoDB
echo -e "\n\n\nInstalling MongoDB:"
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
echo -e "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod

# Install postfix
echo -e "\n\n\nInstalling postfix"
sudo apt install -y postfix

echo -e "\n\nAdding 'cse356.compas.cs.stonybrook.edu' to the relay attribute in /etc/postfix.main.cf"
CONFIG="/etc/postfix/main.cf"
REPLACEMENT_VALUE="cse356.compas.cs.stonybrook.edu"
sudo sed -i "s/^relayhost =.*/relayhost = $REPLACEMENT_VALUE/" $CONFIG

sudo systemctl reload postfix
sudo ufw allow 'Postfix'
sudo ufw allow 80

# Server routing commands
# RUN THESE EACH RESTART
sudo ip6tables -I OUTPUT -p tcp -m tcp --dport 25 -j DROP
sudo iptables -t nat -I OUTPUT -o eth0 -p tcp -m tcp --dport 25 -j DNAT --to-destination 130.245.171.151:11587

# Remaining Manual Steps
# - Make sure that DNS system is set up appropriately
# - Start Application Server