# Quick Deploy - Ubuntu/Linux Server

## One-Time Setup

1. **Get GitHub token:**
   - https://github.com/settings/tokens
   - Generate new token (classic)
   - Check `repo` permission
   - Copy the token

2. **Set token (add to ~/.bashrc for permanent):**
   ```bash
   export GITHUB_TOKEN="your-token-here"
   ```

## Deploy

```bash
npm run deploy
```

That's it! The module is immediately available for testing.

## Install in Foundry VTT

Use manifest URL:
```
https://raw.githubusercontent.com/epistemophoros/FoundryBank/main/module.json
```

## Requirements

- `curl` (usually pre-installed)
- `jq` (install with: `sudo apt install jq`)
- `zip` (install with: `sudo apt install zip`)
