# Move to the backend directory
cd back\

# Make sure you have python 3.11 installed
if (-not (python --version) -match "3.11") {
    Write-Host "Please install python 3.11"
    exit 1
}

# Make sure the build directory exists
if (-not (Test-Path "build")) {
    New-Item -ItemType Directory -Name "build"
}

if (-not (Test-Path "build\.venv")) {
    # Create a virtual environment if it doesn't exist
    python -m venv build\.venv
}

build\.venv\Scripts\pip install -U pip setuptools wheel

build\.venv\Scripts\pip install pyinstaller

# Install whombat
build\.venv\Scripts\pip install .

# Run pyinstaller to bundle whombat into an executable file
build\.venv\Scripts\pyinstaller `
    --hidden-import "app" `
    --hidden-import "aiosqlite" `
    --hidden-import "logging.config" `
    --hidden-import "colorama" `
    --hidden-import "passlib.handlers.bcrypt" `
    --add-data "src\whombat\migrations;whombat\migrations" `
    --add-data "src\whombat\statics;whombat\statics" `
    --add-data "src\whombat\user_guide;whombat\user_guide" `
    --add-data "alembic.ini;." `
    --recursive-copy-metadata "numpy" `
    --name whombat `
    --onefile `
    --console `
    --splash "..\assets\splash.png" `
    app.py


# Zip the executable file 
Compress-Archive -Path "dist\whombat.exe" -DestinationPath "dist\whombat.zip"
