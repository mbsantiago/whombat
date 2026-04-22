#!/bin/bash
# This script is used to update the user guide

# Make sure uv is installed
if ! command -v uv &>/dev/null; then
	echo "Please install uv"
	exit 1
fi

if ! command -v just &>/dev/null; then
	echo "Please install just"
	exit 1
fi

# Move to the root directory of the backend
cd back

# Make sure all development dependencies are installed
uv sync --all-extras --dev --locked

# Build the user guide
just build-guide
