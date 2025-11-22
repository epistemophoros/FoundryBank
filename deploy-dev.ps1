# PowerShell script to build, package, and upload to GitHub pre-release
# Requires GITHUB_TOKEN environment variable set with a GitHub Personal Access Token

param(
    [string]$Token = $env:GITHUB_TOKEN,
    [string]$Repo = "epistemophoros/FoundryBank",
    [string]$Version = "1.0.0"
)

if (-not $Token) {
    Write-Host "ERROR: GITHUB_TOKEN environment variable not set!" -ForegroundColor Red
    Write-Host "Create a Personal Access Token at: https://github.com/settings/tokens" -ForegroundColor Yellow
    Write-Host "Then set it: `$env:GITHUB_TOKEN = 'your-token-here'" -ForegroundColor Yellow
    exit 1
}

# Build TypeScript
Write-Host "Building TypeScript..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Create release structure
Write-Host "Creating release structure..." -ForegroundColor Green
if (Test-Path "foundrybank") { Remove-Item -Recurse -Force "foundrybank" }
New-Item -ItemType Directory -Path "foundrybank" | Out-Null

# Copy necessary files
Copy-Item -Recurse scripts, templates, styles, lang, icons -Destination foundrybank -ErrorAction SilentlyContinue
Copy-Item module.json, LICENSE, README.md -Destination foundrybank -ErrorAction SilentlyContinue

# Create ZIP file
Write-Host "Creating ZIP file..." -ForegroundColor Green
if (Test-Path "foundrybank.zip") { Remove-Item -Force "foundrybank.zip" }
Compress-Archive -Path foundrybank\* -DestinationPath foundrybank.zip -Force

# Cleanup temp directory
Remove-Item -Recurse -Force foundrybank

# GitHub API setup
$headers = @{
    "Authorization" = "token $Token"
    "Accept" = "application/vnd.github.v3+json"
}

$tagName = "v$Version-dev"
$releaseName = "$tagName (Development Build)"

# Check if pre-release exists
Write-Host "Checking for existing pre-release..." -ForegroundColor Green
$releasesUrl = "https://api.github.com/repos/$Repo/releases"
$releases = Invoke-RestMethod -Uri $releasesUrl -Headers $headers -Method Get
$prerelease = $releases | Where-Object { $_.prerelease -eq $true -and $_.tag_name -eq $tagName } | Select-Object -First 1

if ($prerelease) {
    Write-Host "Found existing pre-release, updating..." -ForegroundColor Yellow
    $releaseId = $prerelease.id
    
    # Delete existing asset if it exists
    if ($prerelease.assets.Count -gt 0) {
        $assetId = $prerelease.assets[0].id
        Write-Host "Deleting old asset..." -ForegroundColor Yellow
        Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/assets/$assetId" -Headers $headers -Method Delete
    }
    
    # Update release
    $updateBody = @{
        tag_name = $tagName
        name = $releaseName
        body = "Development build - automatically updated. Use this for testing."
        prerelease = $true
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/$releaseId" -Headers $headers -Method Patch -Body $updateBody -ContentType "application/json"
} else {
    Write-Host "Creating new pre-release..." -ForegroundColor Green
    $createBody = @{
        tag_name = $tagName
        name = $releaseName
        body = "Development build - automatically updated. Use this for testing."
        prerelease = $true
    } | ConvertTo-Json
    
    $prerelease = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases" -Headers $headers -Method Post -Body $createBody -ContentType "application/json"
    $releaseId = $prerelease.id
}

# Upload ZIP file
Write-Host "Uploading ZIP file to GitHub..." -ForegroundColor Green
$uploadUrl = "https://uploads.github.com/repos/$Repo/releases/$releaseId/assets?name=foundrybank.zip"
$fileBytes = [System.IO.File]::ReadAllBytes("$PWD\foundrybank.zip")
$uploadHeaders = @{
    "Authorization" = "token $Token"
    "Accept" = "application/vnd.github.v3+json"
    "Content-Type" = "application/zip"
}

try {
    $response = Invoke-RestMethod -Uri $uploadUrl -Headers $uploadHeaders -Method Post -Body $fileBytes
    Write-Host "✓ Successfully uploaded to pre-release!" -ForegroundColor Green
    Write-Host "Release URL: $($prerelease.html_url)" -ForegroundColor Cyan
    Write-Host "Download URL: https://github.com/$Repo/releases/download/$tagName/foundrybank.zip" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR uploading file: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nDone! The module is now available for testing." -ForegroundColor Green
Write-Host "Manifest URL: https://raw.githubusercontent.com/$Repo/main/module.json" -ForegroundColor Cyan

