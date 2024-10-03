#!/bin/bash
# This script is used to update the user guide

# Make sure uv is installed
if ! command -v uv; then
    echo "Please install uv"
    exit 1
fi

# Move to the root directory of the backend
cd back

# Make sure all development dependencies are installed
uv sync --dev

# Build the user guide
make build-guide
