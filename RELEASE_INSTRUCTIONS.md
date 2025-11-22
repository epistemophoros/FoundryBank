# How to Create a GitHub Release for Foundry VTT

## Quick Steps

1. **Build and create the ZIP:**
   ```powershell
   .\create-release.ps1
   ```
   (Or `./create-release.sh` on Linux/Mac)

2. **Go to GitHub Releases:**
   - Visit: https://github.com/epistemophoros/FoundryBank/releases/new
   - Tag: `v1.0.0`
   - Title: `v1.0.0`
   - Description: `Initial release of FoundryBank`
   - Upload `foundrybank.zip` file
   - Click "Publish release"

3. **After release is created, the manifest URL will work:**
   ```
   https://raw.githubusercontent.com/epistemophoros/FoundryBank/main/module.json
   ```

## Automatic Release (Future)

Once you create a release, the GitHub Action will automatically create releases for future tags.

To create a new release:
```bash
git tag v1.0.1
git push origin v1.0.1
```

The workflow will automatically build and create the release ZIP.

