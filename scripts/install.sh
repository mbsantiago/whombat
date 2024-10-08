#!/bin/bash
# Description: Install whombat python dependencies as an editable package

# Make sure you have python 3.11 installed
if [[ ! $(python --version) =~ "3.12" ]]; then
	echo "Please install python 3.12"
	exit 1
fi

# Move to the root directory of the backend
cd back

# Update pip and setuptools
pip install -U pip setuptools wheel

# Install the dependencies and whombat as an editable package
pip install -U -e .

echo "Installation complete. You can now run whombat with the command 'python -m whombat'"
