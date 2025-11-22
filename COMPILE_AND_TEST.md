# Compile and Test Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile TypeScript
```bash
npm run build
```
This compiles all TypeScript files from `src/` to `scripts/`.

### 3. Check for Errors (Without Compiling)
```bash
npm run check
```
This runs TypeScript compiler in check-only mode (no output files).

### 4. Verify All Systems (External Testing)
```bash
npm run verify
```
This runs the verification script that tests all systems without needing Foundry VTT.

## Available Commands

### `npm run build`
- Compiles TypeScript to JavaScript
- Output: `scripts/foundrybank.js` and related files
- Use this before deploying to Foundry VTT

### `npm run watch`
- Watches for changes and auto-compiles
- Useful during development
- Press Ctrl+C to stop

### `npm run check` or `npm run lint`
- Type-checks code without generating files
- Fast way to find TypeScript errors
- No output files created

### `npm run verify`
- Runs external verification tests
- Tests all systems without Foundry VTT
- Mocks Foundry globals for testing
- Shows which features work correctly

## Verification Script

The `test/verify-systems.ts` script tests:

✅ **Economy System**
- Create economies
- Create currencies
- Set exchange rates
- Currency conversion

✅ **Bank Manager**
- Create banks
- Create accounts
- Deposits
- Withdrawals
- Balance tracking

✅ **Property Manager**
- Create properties
- Purchase properties
- Account integration
- Currency conversion

✅ **Loan Manager**
- Create loans
- Make payments
- Interest calculation

✅ **Stock Manager**
- Create stocks
- Buy stocks
- Portfolio tracking

✅ **Banker System**
- Register bankers
- Bank linking

## What Gets Tested

The verification script tests:
- ✅ All manager classes instantiate correctly
- ✅ All create methods work
- ✅ All data operations (CRUD) work
- ✅ All calculations (interest, exchange, etc.) work
- ✅ All integrations between systems work
- ✅ Error handling works

## What's NOT Tested (Requires Foundry VTT)

- ❌ UI rendering (Handlebars templates)
- ❌ User interactions (clicks, dialogs)
- ❌ Foundry VTT hooks
- ❌ Settings UI
- ❌ Token interactions

## Development Workflow

### 1. Make Code Changes
Edit files in `src/`

### 2. Check for Errors
```bash
npm run check
```

### 3. Verify Logic Works
```bash
npm run verify
```

### 4. Build for Foundry
```bash
npm run build
```

### 5. Test in Foundry VTT
- Copy module to Foundry's `Data/modules/` folder
- Enable module in world
- Test UI and interactions

## Troubleshooting

### TypeScript Errors
```bash
npm run check
```
Fixes most issues before building.

### Verification Failures
Check the error messages in `npm run verify` output.
Common issues:
- Missing dependencies
- Incorrect data types
- Logic errors

### Build Errors
```bash
npm run build
```
Check `tsconfig.json` settings if build fails.

## File Structure After Build

```
foundrybank/
├── src/              # TypeScript source (edit these)
├── scripts/           # Compiled JavaScript (generated)
│   └── foundrybank.js
├── templates/        # Handlebars templates
├── styles/           # CSS files
└── module.json       # Foundry manifest
```

## Continuous Development

Use watch mode for active development:
```bash
npm run watch
```

Then in another terminal, test changes:
```bash
npm run verify
```

## Pre-Deployment Checklist

Before deploying to Foundry VTT:

1. ✅ Run `npm run check` - No errors
2. ✅ Run `npm run verify` - All tests pass
3. ✅ Run `npm run build` - Successful compilation
4. ✅ Check `scripts/` folder has compiled files
5. ✅ Test in Foundry VTT - UI works correctly

## Summary

- **`npm run check`** - Fast error checking
- **`npm run verify`** - Test all systems externally
- **`npm run build`** - Compile for Foundry VTT
- **`npm run watch`** - Auto-compile during development

The verification script ensures all backend logic works correctly, so any remaining issues would be UI-related (templates, styling, Foundry VTT integration).

