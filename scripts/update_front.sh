#!/bin/bash
# This script is used to update the front end of the website

# Move to the root directory of the backend
cd back

# Delete the old static files
rm -rf src/whombat/statics/*

# Go to the root directory of the frontend
cd ../front

# Install the dependencies
npm install

# Run the build script
npm run build

# Make sure the statics folder exists
if [ ! -d "../back/src/whombat/statics" ]; then
    mkdir ../back/src/whombat/statics
fi

# Move the static files to the backend
mv out/* ../back/src/whombat/statics/
