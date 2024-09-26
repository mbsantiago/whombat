#!/bin/bash

# Make sure you have uv installed
if ! command -v uv &>/dev/null; then
    echo "Please install uv"
    echo "See https://docs.astral.sh/uv/getting-started/installation/ for installation instructions."
    exit 1
fi

# Go to the backend directory
cd back

# Install dependencies
uv sync --with-dev
