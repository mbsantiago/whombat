#!/bin/bash
# This script is used to update the user guide

# Move to the root directory of the backend
cd back

# Make sure there is a virtual environment
if [ ! -d .venv ]; then
  python -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

pip install .[docs]

# Build the user guide
make build-guide
