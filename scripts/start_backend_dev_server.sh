#!/bin/bash
# Description: Starts the backend development server

# Load environment variables for development
source scripts/dev_env.sh

if ! command -v just &>/dev/null; then
	echo "Please install just"
	exit 1
fi

# Move to the root directory of the backend
cd back

# Make sure there is a virtual environment
if [ ! -d .venv ]; then
	# Exit if the virtual environment does not exist
	echo "Virtual environment does not exist. Please run just install-back or scripts/install_dev.sh first."
	exit 1
fi

# Run the server
just serve
