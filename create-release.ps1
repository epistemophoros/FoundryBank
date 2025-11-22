# PowerShell script to create a proper Foundry VTT release ZIP

# Build TypeScript
Write-Host "Building TypeScript..." -ForegroundColor Green
npm run build

# Create temporary directory with correct module name
Write-Host "Creating release structure..." -ForegroundColor Green
if (Test-Path "foundrybank") { Remove-Item -Recurse -Force "foundrybank" }
New-Item -ItemType Directory -Path "foundrybank" | Out-Null

# Copy necessary files
Copy-Item -Recurse scripts, templates, styles, lang, icons -Destination foundrybank
Copy-Item module.json, LICENSE, README.md -Destination foundrybank

# Create ZIP file
Write-Host "Creating ZIP file..." -ForegroundColor Green
if (Test-Path "foundrybank.zip") { Remove-Item -Force "foundrybank.zip" }
Compress-Archive -Path foundrybank\* -DestinationPath foundrybank.zip -Force

# Cleanup
Remove-Item -Recurse -Force foundrybank

Write-Host "Release ZIP created: foundrybank.zip" -ForegroundColor Green
Write-Host "Upload this to GitHub Releases!" -ForegroundColor Yellow

