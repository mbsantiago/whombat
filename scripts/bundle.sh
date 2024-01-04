#!/bin/bash
# Description: Bundle whombat into an executable file with pyinstaller

# Move to the backend directory
cd back/

# Make sure you have python 3.11 installed
if [[ ! $(python --version) =~ "3.11" ]]; then
	echo "Please install python 3.11"
	exit 1
fi

# Make sure the build directory exists
if [ ! -d "build" ]; then
	mkdir build
fi

if [ ! -d "build/.venv" ]; then
	# Create a virtual environment if it doesn't exist
	python -m venv build/.venv
fi

# Activate the virtual environment
source build/.venv/bin/activate

pwd

# Whombat dependencies should be installed in the virtual environment
pip install .

# Pyinstaller should be installed in the virtual environment
pip install pyinstaller

# Run pyinstaller to bundle whombat into an executable file
pyinstaller \
	--hidden-import "app" \
	--hidden-import "aiosqlite" \
	--hidden-import "logging.config" \
	--hidden-import "passlib.handlers.bcrypt" \
	--add-data "src/whombat/migrations:whombat/migrations" \
	--add-data "src/whombat/statics:whombat/statics" \
	--add-data "alembic.ini:." \
	--splash "docs/assets/logo.png" \
	--name whombat \
	app.py
