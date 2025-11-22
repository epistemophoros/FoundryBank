# How to Compile + Release for Foundry VTT

## Super Simple - Just Push!

**That's it!** Just push to `main` and it automatically:
1. ✅ Compiles TypeScript
2. ✅ Creates ZIP file
3. ✅ Uploads to GitHub pre-release
4. ✅ Ready to download in Foundry VTT

## Steps

1. **Make your changes** in `src/` files

2. **Check for errors:**
   ```bash
   npm run check
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

4. **Wait 1-2 minutes** for GitHub Actions to finish

5. **Install in Foundry VTT:**
   - Go to **Add-on Modules** → **Install Module**
   - Paste: `https://raw.githubusercontent.com/epistemophoros/FoundryBank/main/module.json`
   - Click **Install**

## Manual Compile (If Needed)

If you want to compile locally first:

```bash
# Build TypeScript
npm run build

# Check it worked
npm run check
```

Then commit and push - the workflow will handle the rest!

## What Happens Automatically

When you push to `main`:
- GitHub Actions runs
- Builds TypeScript → `scripts/` folder
- Creates `foundrybank.zip` with all files
- Uploads to pre-release `v1.0.0-dev`
- Foundry VTT can download it immediately

## Check Status

View the workflow at:
https://github.com/epistemophoros/FoundryBank/actions

Green checkmark = Ready to download! ✅

