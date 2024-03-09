#!/bin/bash

# Once you've cloned the repository: 
# git clone https://github.com/joeyboi145/cse356_wp2_jjm.git

# THIS IS FOR UBUNTU 22.04
# 1. Install node.js and npm
# 2. Install node.js dependences
#   - express
#   - mongoose
#   - connect-mongodb-session
#   - nodemailer
#   - nodemailer-smtp-transport
#   - JIMP
#   - cookie-session
# 3. Install mongoDB
# 4. Install & configure Postfix


# Install current nodejs and npm
echo -e "\nInstalling Node.js:"
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

echo -e "\nInstall NPM"
sudo apt install -y npm

# Install node.js dependences
echo -e "\nInstalling project dependences"
cd application
npm install express
npm install express-sessions
npm install mongoose
npm install nodemailer
npm install jimp
cd ..

# Install mongoDB
echo -e "\nInstalling MongoDB:"
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Install postfix
echo -e "\nInstalling postfix"
# echo -e "REMEMBER: set relay domain to \'cse356.compas.cs.stonybrook.edu\'"
sudo apt install -y postfix
sudo systemctl reload postfix
sudo ufw allow 'Postfix'

echo -e "\nAdding 'cse356.compas.cs.stonybrook.edu' to the relay attribute in /etc/postfix.main.cf"
TARGET_KEY = "relayhost"
REPLACEMENT_VALUE = "cse356.compas.cs.stonybrook.edu"
CONFIG_FILE = "/etc/postfix/main.cf"
sed -c -i "s/\($TARGET_KEY *= *\).*/\1$REPLACEMENT_VALUE/" $CONFIG_FILE

# Server routing commands
# RUN THESE EACH RESTART
sudo ip6tables -I OUTPUT -p tcp -m tcp --dport 25 -j DROP
sudo iptables -t nat -I OUTPUT -o eth0 -p tcp -m tcp --dport 25 -j DNAT --to-destination 130.245.171.151:11587

# Remaining Manual Steps
# - Make sure that DNS system is set up appropriately
# - Start Application Server