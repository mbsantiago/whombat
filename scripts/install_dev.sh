#!/bin/bash

# Make sure you have python 3.11 installed
if [[ ! $(python --version) =~ "3.11" ]]; then
	echo "Please install python 3.11"
	exit 1
fi

# Install pdm if not installed
if ! command -v pdm &>/dev/null; then
	echo "Installing pdm"
	curl -sSL https://pdm-project.org/install-pdm.py | python -
fi

# Go to the backend directory
cd back

# Install dependencies
pdm install -G :all -d
