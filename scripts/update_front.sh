#!/bin/bash
# This script is used to update the front end of the website

# Delete the old static files
if [ -d "back/src/whombat/statics" ]; then
	rm -rf back/src/whombat/statics
fi

# Go to the root directory of the frontend
cd front

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
