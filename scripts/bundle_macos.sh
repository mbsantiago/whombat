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

build/.venv/bin/pip install -U pip setuptools wheel

build/.venv/bin/pip install pyinstaller

# Install whombat
build/.venv/bin/pip install .

# Run pyinstaller to bundle whombat into an executable file
build/.venv/bin/pyinstaller \
	--hidden-import "app" \
	--hidden-import "aiosqlite" \
	--hidden-import "colorama" \
	--hidden-import "logging.config" \
	--hidden-import "passlib.handlers.bcrypt" \
	--add-data "src/whombat/migrations:whombat/migrations" \
	--add-data "src/whombat/statics:whombat/statics" \
	--add-data "src/whombat/user_guide:whombat/user_guide" \
	--add-data "alembic.ini:." \
	--name whombat \
	--onefile \
	--console \
	app.py

chmod +x dist/whombat

# Zip the executable file
zip -r dist/whombat.zip dist/whombat
