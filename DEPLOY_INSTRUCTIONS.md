# Automatic Deployment to GitHub

This script automatically builds, packages, and uploads the module to a GitHub draft release so you can test it immediately.

## Setup (One-Time)

1. **Create a GitHub Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a name like "FoundryBank Deploy"
   - Select scope: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Set the token as an environment variable:**
   
   **PowerShell (Current Session):**
   ```powershell
   $env:GITHUB_TOKEN = "your-token-here"
   ```
   
   **PowerShell (Permanent - User Level):**
   ```powershell
   [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your-token-here', 'User')
   ```
   Then restart your terminal.

   **Command Prompt:**
   ```cmd
   setx GITHUB_TOKEN "your-token-here"
   ```
   Then restart your terminal.

## Usage

After setting up the token, simply run:

```powershell
npm run deploy
```

Or directly:

```powershell
.\deploy-dev.ps1
```

## What It Does

1. ✅ Builds TypeScript (`npm run build`)
2. ✅ Creates the release ZIP file
3. ✅ Creates or updates a draft release on GitHub (tag: `v1.0.0-dev`)
4. ✅ Uploads the ZIP file to that release
5. ✅ Makes it available for download immediately

## Testing in Foundry VTT

After running `npm run deploy`, the module is immediately available:

1. Open Foundry VTT
2. Go to **Add-on Modules** → **Install Module**
3. Paste this manifest URL:
   ```
   https://raw.githubusercontent.com/epistemophoros/FoundryBank/main/module.json
   ```
4. Click **Install** - it will download from the dev release automatically!

## Notes

- The release is created as a **draft**, so it won't show up in the public releases list
- The tag is `v1.0.0-dev` - you can change this in the script if needed
- Each time you run `npm run deploy`, it updates the same draft release
- The ZIP file is automatically replaced with the new build

## Troubleshooting

**"GITHUB_TOKEN environment variable not set"**
- Make sure you set the token (see Setup above)
- Restart your terminal after setting it
- Check with: `echo $env:GITHUB_TOKEN` (PowerShell) or `echo %GITHUB_TOKEN%` (CMD)

**"Build failed"**
- Run `npm run check` to see TypeScript errors
- Fix any errors before deploying

**"ERROR uploading file"**
- Check your token has `repo` permissions
- Make sure the repository exists and you have write access

