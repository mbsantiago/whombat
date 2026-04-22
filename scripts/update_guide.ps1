if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
  Write-Host "Please install uv"
  exit 1
}

if (-not (Get-Command just -ErrorAction SilentlyContinue)) {
  Write-Host "Please install just"
  exit 1
}

# Move to the root directory of the backend
cd back

# Make sure all development dependencies are installed
uv sync --all-extras --dev --locked

# Build the user guide
just build-guide
