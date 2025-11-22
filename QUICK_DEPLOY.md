# Quick Deploy - Get Testing in 2 Minutes!

## Step 1: Get GitHub Token (30 seconds)

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Name it: `FoundryBank Deploy`
4. Check the **`repo`** checkbox
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)

## Step 2: Set Token (10 seconds)

**In PowerShell, run:**
```powershell
$env:GITHUB_TOKEN = "paste-your-token-here"
```

## Step 3: Deploy! (30 seconds)

```powershell
npm run deploy
```

That's it! The module is now available for testing in Foundry VTT.

## Install in Foundry VTT

1. Open Foundry VTT
2. **Add-on Modules** → **Install Module**
3. Paste: `https://raw.githubusercontent.com/epistemophoros/FoundryBank/main/module.json`
4. Click **Install**

## Update Anytime

Just run `npm run deploy` again - it automatically updates the same release!

---

**Note:** The token is only for this terminal session. To make it permanent, see `DEPLOY_INSTRUCTIONS.md`.

