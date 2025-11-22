#!/bin/bash
# Script to create a proper Foundry VTT release ZIP

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Create temporary directory with correct module name
echo "Creating release structure..."
rm -rf foundrybank
mkdir -p foundrybank

# Copy necessary files
cp -r scripts templates styles lang icons foundrybank/
cp module.json LICENSE README.md foundrybank/

# Create ZIP file
echo "Creating ZIP file..."
rm -f foundrybank.zip
zip -r foundrybank.zip foundrybank/

# Cleanup
rm -rf foundrybank

echo "Release ZIP created: foundrybank.zip"
echo "Upload this to GitHub Releases!"

