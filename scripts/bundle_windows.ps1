# Description: Bundle whombat into an executable file with pyinstaller

# Make sure you have uv installed
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Error "Please install uv"
    exit 1
}

# Run pyinstaller to bundle whombat into an executable file
uvx --python 3.12 --with-editable back --isolated pyinstaller whombat.spec

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to bundle whombat into an executable file"
    exit 1
}

# Zip the executable file
Compress-Archive -Path "dist\whombat.exe" -DestinationPath "dist\whombat.zip"
