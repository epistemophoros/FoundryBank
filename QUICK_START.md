# Quick Start - Compile & Test

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Check for TypeScript Errors (No Compilation)

```bash
npm run check
```

This checks for TypeScript errors **without** generating files. Fast way to verify code is correct.

## Step 3: Test Business Logic (External)

```bash
npm run test
```

This tests all business logic **without needing Foundry VTT**:
- ✅ Economy creation
- ✅ Currency calculations
- ✅ Bank operations
- ✅ Interest calculations
- ✅ Exchange rates
- ✅ Property logic
- ✅ Loan calculations

**What this verifies:**
- All calculations are correct
- Data structures work
- Logic is sound
- Only UI needs Foundry VTT testing

## Step 4: Build TypeScript

```bash
npm run build
```

This compiles TypeScript to JavaScript in `scripts/` directory.

## Step 5: Test in Foundry VTT

After building, copy to Foundry VTT and test:
- UI dialogs
- User interactions
- Token clicks
- GM Manager

## All-in-One Commands

```bash
# Check + Test
npm run test:all

# Build + Test
npm run build && npm run test

# Watch mode (auto-compile on changes)
npm run watch
```

## What Gets Tested Where

### External (Node.js) - `npm run test`
- ✅ All business logic
- ✅ Calculations
- ✅ Data structures
- ✅ Validation

### Foundry VTT Only
- ✅ UI components
- ✅ Dialog rendering
- ✅ Token interactions
- ✅ Settings UI

## Summary

1. `npm run check` - Verify TypeScript (no files generated)
2. `npm run test` - Test all logic externally
3. `npm run build` - Compile to JavaScript
4. Test UI in Foundry VTT

If all external tests pass, **only UI needs testing in Foundry VTT!**
