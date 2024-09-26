#!/bin/bash
# Description: Bundle whombat into an executable file with pyinstaller

# Make sure you have uv installed
if ! command -v uv &> /dev/null; then
    echo "Please install uv"
    exit 1
fi

# Run pyinstaller to bundle whombat into an executable file
uvx --python 3.12 --with-editable back --isolated pyinstaller whombat.spec

if [ $? -ne 0 ]; then
    echo "Failed to bundle whombat into an executable file"
    exit 1
fi

chmod +x dist/whombat

# Zip the executable file
zip -r dist/whombat.zip dist/whombat
