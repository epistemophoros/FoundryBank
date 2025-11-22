# Building FoundryBank

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Check for Errors (No Compilation)**
   ```bash
   npm run check
   ```
   Fast way to find TypeScript errors without generating files.

3. **Verify All Systems (External Testing)**
   ```bash
   npm run verify
   ```
   Tests all backend systems without needing Foundry VTT.

4. **Build TypeScript**
   ```bash
   npm run build
   ```
   This will compile all TypeScript files from `src/` to `scripts/`.

5. **Watch Mode (Development)**
   ```bash
   npm run watch
   ```
   This will automatically rebuild when you make changes to TypeScript files.

## Project Structure

```
foundrybank/
├── src/                    # TypeScript source files
│   ├── foundrybank.ts     # Main module entry point
│   ├── bank-manager.ts    # Core banking logic
│   ├── bank-dialog.ts     # UI dialog class
│   ├── bank-settings.ts   # Settings configuration
│   └── handlebars-helpers.ts # Template helpers
├── scripts/                # Compiled JavaScript (generated)
│   └── foundrybank.js     # Main compiled file
├── templates/              # Handlebars templates
├── styles/                 # CSS stylesheets
├── lang/                   # Localization files
├── module.json            # Module manifest
├── package.json           # npm configuration
└── tsconfig.json          # TypeScript configuration
```

## Development Workflow

1. Make changes to TypeScript files in `src/`
2. Run `npm run build` or use `npm run watch` for auto-rebuild
3. Test in Foundry VTT
4. Repeat

## Notes

- The compiled JavaScript files in `scripts/` should not be edited manually
- Always build before committing changes
- The `scripts/` directory is gitignored, but you may want to include it in releases

