#!/bin/bash
# Description: Starts the backend development server

# Load environment variables for development
source scripts/dev_env.sh

# Make sure there is a virtual environment
if [ ! -d .venv ]; then
  pmd install
fi

# Activate virtual environment
source .venv/bin/activate

# Run the server
make dev
