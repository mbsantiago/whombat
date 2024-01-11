#!/bin/bash
# This script is used to update the user guide

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

# Build the user guide
make build-guide
