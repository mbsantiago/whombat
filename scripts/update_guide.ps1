# Move to the root directory of the backend
cd back

# Make sure there is a virtual environment
if (-not (Test-Path .venv)) {
  python -m venv .venv
}

# Activate virtual environment
.venv\Scripts\activate

# Install necessary packages
pip install .[docs]

# Build the user guide
make build-guide
