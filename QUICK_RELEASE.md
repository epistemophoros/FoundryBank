# Quick Release Setup - DO THIS NOW!

## The Problem
Foundry VTT is trying to download from a GitHub release that doesn't exist yet. You need to create the release.

## Steps to Fix (Takes 2 minutes):

1. **The ZIP file is already created** - `foundrybank.zip` is in your project folder

2. **Go to GitHub and create the release:**
   - Open: https://github.com/epistemophoros/FoundryBank/releases/new
   - **Tag version:** `v1.0.0` (must start with `v`)
   - **Release title:** `v1.0.0 - Initial Release`
   - **Description:** `Initial release of FoundryBank banking system for Foundry VTT`
   - **Drag and drop** the `foundrybank.zip` file into the "Attach binaries" section
   - Click **"Publish release"**

3. **After the release is published**, the manifest URL will work:
   ```
   https://raw.githubusercontent.com/epistemophoros/FoundryBank/main/module.json
   ```

4. **Try installing again in Foundry VTT** - it should work now!

## Accessing the GM Manager

Once the module is installed and loaded:

1. **Go to Settings** → **Configure Settings**
2. **Click on "Module Settings"** tab (left sidebar)
3. **Find "FoundryBank"** in the list
4. **Click the "Open FoundryBank Manager" button** at the bottom of the FoundryBank settings section

OR

- Look for **"FoundryBank Manager"** in the settings navigation menu (left side) and click it

The GM Manager lets you create economies, currencies, banks, properties, stocks, and manage everything!

