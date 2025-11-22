#!/bin/bash
# Simple script to build, package, and upload to GitHub draft release
# Works on Linux/Ubuntu servers

set -e  # Exit on error

REPO="epistemophoros/FoundryBank"
VERSION="1.0.0"
TAG_NAME="v${VERSION}-dev"

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "ERROR: GITHUB_TOKEN environment variable not set!"
    echo "Set it with: export GITHUB_TOKEN='your-token-here'"
    exit 1
fi

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Create release structure
echo "Creating release structure..."
rm -rf foundrybank
mkdir -p foundrybank

# Copy necessary files
cp -r scripts templates styles lang icons foundrybank/ 2>/dev/null || true
cp module.json LICENSE README.md foundrybank/ 2>/dev/null || true

# Create ZIP file
echo "Creating ZIP file..."
rm -f foundrybank.zip
cd foundrybank
zip -r ../foundrybank.zip . > /dev/null
cd ..
rm -rf foundrybank

# GitHub API setup
API_URL="https://api.github.com/repos/${REPO}/releases"
AUTH_HEADER="Authorization: token ${GITHUB_TOKEN}"

# Check if draft release exists
echo "Checking for existing draft release..."
EXISTING=$(curl -s -H "$AUTH_HEADER" "$API_URL" | jq -r ".[] | select(.draft == true and .tag_name == \"$TAG_NAME\") | .id" | head -1)

if [ -n "$EXISTING" ]; then
    echo "Updating existing draft release..."
    RELEASE_ID=$EXISTING
    
    # Delete existing asset if it exists
    ASSETS=$(curl -s -H "$AUTH_HEADER" "${API_URL}/${RELEASE_ID}/assets" | jq -r '.[].id')
    for asset_id in $ASSETS; do
        curl -s -X DELETE -H "$AUTH_HEADER" "https://api.github.com/repos/${REPO}/releases/assets/${asset_id}" > /dev/null
    done
    
    # Update release
    curl -s -X PATCH \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" \
        -d "{\"tag_name\":\"$TAG_NAME\",\"name\":\"$TAG_NAME (Development Build)\",\"body\":\"Development build - automatically updated. Use this for testing.\",\"draft\":true}" \
        "${API_URL}/${RELEASE_ID}" > /dev/null
else
    echo "Creating new draft release..."
    RESPONSE=$(curl -s -X POST \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" \
        -d "{\"tag_name\":\"$TAG_NAME\",\"name\":\"$TAG_NAME (Development Build)\",\"body\":\"Development build - automatically updated. Use this for testing.\",\"draft\":true}" \
        "$API_URL")
    RELEASE_ID=$(echo "$RESPONSE" | jq -r '.id')
fi

# Upload ZIP file
echo "Uploading ZIP file to GitHub..."
UPLOAD_URL="https://uploads.github.com/repos/${REPO}/releases/${RELEASE_ID}/assets?name=foundrybank.zip"

curl -s -X POST \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/zip" \
    --data-binary "@foundrybank.zip" \
    "$UPLOAD_URL" > /dev/null

echo "✓ Successfully uploaded!"
echo "Download URL: https://github.com/${REPO}/releases/download/${TAG_NAME}/foundrybank.zip"
echo "Manifest URL: https://raw.githubusercontent.com/${REPO}/main/module.json"

