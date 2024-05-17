#!/bin/bash

# Make sure you have python 3.11 installed
if [[ ! $(python --version) =~ "3.11" ]]; then
	echo "Please install python 3.11"
	exit 1
fi

# Install rye if not installed
if ! command -v rye &>/dev/null; then
	echo "Installing rye"
    curl -sSf https://rye-up.com/get | bash
fi

# Go to the backend directory
cd back

# Install dependencies
rye sync
