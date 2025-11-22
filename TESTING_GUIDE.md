# FoundryBank Testing Guide

## How to Compile and Test

### Step 1: Install Dependencies

```bash
npm install
```

This installs TypeScript and other dev dependencies.

### Step 2: Compile TypeScript

```bash
npm run build
```

This compiles all TypeScript files from `src/` to `scripts/`.

**What this does:**
- Compiles `src/*.ts` → `scripts/*.js`
- Checks for TypeScript errors
- Validates types

**Expected output:**
- Compiled JavaScript files in `scripts/` directory
- No compilation errors

### Step 3: Test Business Logic

```bash
npm run test
```

This runs the logic test script that verifies:
- Economy creation logic
- Currency creation logic
- Bank creation logic
- Account operations (deposit, withdraw)
- Interest calculations
- Exchange rate calculations
- Property purchase logic
- Loan calculations

**What this tests:**
- ✅ All business logic (no UI)
- ✅ Data structures
- ✅ Calculations
- ✅ Validation logic

**What this doesn't test:**
- ❌ UI components (need Foundry VTT)
- ❌ Foundry VTT API calls
- ❌ Dialog rendering
- ❌ Template rendering

### Step 4: Verify Systems

```bash
npm run verify
```

This runs a more comprehensive verification that checks:
- System initialization
- Manager instantiation
- Data flow
- Integration points

### Step 5: Build and Test (All-in-One)

```bash
npm run check
```

This runs:
1. `npm run build` (compile TypeScript)
2. `npm run test` (test logic)

## What Can Be Tested Externally

### ✅ Can Test (Business Logic)
- Economy creation and management
- Currency creation and exchange rates
- Bank creation
- Account balance calculations
- Deposit/withdrawal logic
- Transfer calculations
- Interest calculations
- Loan calculations
- Stock price calculations
- Property purchase logic
- Data structure validation
- Error handling logic

### ❌ Cannot Test (Requires Foundry VTT)
- UI dialogs (BankDialog, GMManagerDialog)
- Template rendering (Handlebars)
- Token interactions
- Actor sheet modifications
- Settings UI
- Notifications
- Hooks system
- Foundry VTT API calls
- Data persistence (settings)

## Testing Workflow

### 1. Development Testing
```bash
# Watch mode - auto-compiles on changes
npm run watch

# In another terminal, test logic
npm run test
```

### 2. Pre-Release Testing
```bash
# Build everything
npm run build

# Test all logic
npm run test

# Verify systems
npm run verify
```

### 3. Manual UI Testing (In Foundry VTT)
After compilation:
1. Copy module to Foundry VTT `Data/modules/`
2. Enable module in world
3. Test UI interactions:
   - Open bank dialog
   - Create accounts
   - Make transactions
   - Use GM Manager
   - Interact with bankers

## Understanding Test Results

### ✅ All Tests Pass
- Business logic is correct
- Calculations work
- Data structures valid
- Only UI needs testing in Foundry VTT

### ❌ Tests Fail
- Check error messages
- Fix logic issues
- Re-run tests
- Verify fixes

## Common Issues

### TypeScript Compilation Errors
**Problem:** `tsc` reports errors
**Solution:**
- Check `tsconfig.json` settings
- Verify all imports are correct
- Check for missing type definitions

### Test Script Errors
**Problem:** `npm run test` fails
**Solution:**
- Ensure TypeScript is compiled first (`npm run build`)
- Check that `scripts/` directory has compiled JS files
- Verify Node.js version (should be 18+)

### Missing Dependencies
**Problem:** `npm install` fails
**Solution:**
- Check Node.js version: `node --version` (should be 18+)
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then reinstall

## Verification Checklist

After running tests, verify:

- [ ] TypeScript compiles without errors
- [ ] All business logic tests pass
- [ ] No runtime errors in test scripts
- [ ] Data structures are correct
- [ ] Calculations are accurate
- [ ] Error handling works

Then in Foundry VTT:
- [ ] Module loads without errors
- [ ] GM Manager opens
- [ ] Bank dialog opens
- [ ] All UI interactions work
- [ ] Data persists correctly

## Quick Test Commands

```bash
# Compile only
npm run build

# Test logic only
npm run test

# Verify systems only
npm run verify

# Build + Test
npm run check

# Watch mode (auto-compile)
npm run watch
```

## Expected Test Output

When tests pass, you should see:
```
Testing FoundryBank Business Logic...

Test 1: Economy Creation
✅ Economy created: Test Kingdom

Test 2: Currency Creation
✅ Currency created: GC

... (more tests)

============================================================
All Logic Tests Passed! ✅
============================================================

Note: UI components require Foundry VTT to test.
All business logic has been verified.
```

## Summary

**External Testing (Node.js):**
- ✅ All business logic
- ✅ Calculations
- ✅ Data structures
- ✅ Validation

**Foundry VTT Testing:**
- ✅ UI components
- ✅ User interactions
- ✅ Foundry API integration
- ✅ Data persistence

**Workflow:**
1. `npm run build` - Compile TypeScript
2. `npm run test` - Test logic externally
3. Load in Foundry VTT - Test UI
4. Fix any UI issues found

This ensures all logic is correct before testing UI in Foundry VTT!
