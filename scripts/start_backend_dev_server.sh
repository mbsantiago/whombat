#!/bin/bash
# Description: Starts the backend development server

# Load environment variables for development
source scripts/dev_env.sh

# Move to the root directory of the backend
cd back

# Make sure there is a virtual environment
if [ ! -d .venv ]; then
	# Exit if the virtual environment does not exist
	echo "Virtual environment does not exist. Please run the install_dev.sh script first."
	exit 1
fi

# Activate virtual environment
source .venv/bin/activate

# Run the server
make serve-dev
