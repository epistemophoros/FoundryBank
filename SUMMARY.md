# FoundryBank - Modular Economy Framework Summary

## ✅ What's Been Built

I've refactored FoundryBank into a **modular economy framework** that lets you create economies, currencies, and banks dynamically during your session.

## Core Framework

### 1. **Economy System** (`economy-system.ts`)
- Create economies (kingdoms, factions, regions, etc.)
- Each economy is independent
- Track economic growth per economy
- Base interest rates per economy

### 2. **Currency System** (part of Economy System)
- Create custom currencies for each economy
- Set exchange rates between currencies
- Base currency per economy
- Automatic currency conversion

### 3. **Bank System** (`bank-manager.ts`)
- Banks belong to economies
- Create banks dynamically
- Accounts belong to banks
- Accounts use currencies from the economy

### 4. **Exchange System**
- Trade between any currencies
- Automatic rate calculation
- Cross-economy conversions

## Key Features

✅ **Modular Creation**: Create economies/currencies/banks in-session  
✅ **Independent Economies**: Each kingdom/faction has its own economy  
✅ **Custom Currencies**: Create any currency you need  
✅ **Exchange Rates**: Trade between currencies automatically  
✅ **D&D 5e Safe**: Never touches D&D 5e currency unless explicitly synced  
✅ **Session-Ready**: No pre-configuration needed  

## How It Works

### Example: Creating a Kingdom Economy

```javascript
// 1. Create the economy
const economy = economySystem.createEconomy(
  'Kingdom of Eldoria',
  'A prosperous trading kingdom',
  'kingdom'
);

// 2. Create currencies
const goldCrown = economySystem.createCurrency(
  economy.id,
  'GC', 'Gold Crown', 'Gold Crowns',
  1.0, true // Base currency
);

// 3. Create a bank
const bank = bankManager.createBank(
  'Royal Bank',
  economy.id
);

// 4. Create accounts
const account = bankManager.createAccount(
  bank.id,
  actorId,
  'Savings',
  goldCrown.id
);
```

## D&D 5e Integration

D&D 5e currency is **completely separate**:
- Created as a default economy (for reference only)
- Never used unless you explicitly sync an account
- Sync is optional per account
- When synced, deposits/withdrawals affect character inventory

## Files Created/Modified

### New Files
- `src/economy-system.ts` - Economy and currency framework
- `MODULAR_FRAMEWORK.md` - Framework documentation
- `src/types.d.ts` - TypeScript type declarations

### Modified Files
- `src/bank-manager.ts` - Now uses economies and currency IDs
- `src/foundrybank.ts` - Initializes EconomySystem
- `src/bank-settings.ts` - Added economy data storage

## Next Steps

The framework is complete! You can now:
1. Create economies in-session
2. Create currencies for those economies
3. Create banks tied to economies
4. Create accounts using economy currencies
5. Exchange between currencies

The UI dialogs for creating these dynamically would be the next step, but the backend framework is fully functional.

## API Usage

```javascript
// Get managers
const economySystem = game.foundrybank.getEconomySystem();
const bankManager = game.foundrybank.getBankManager();

// Create economy
const economy = economySystem.createEconomy('My Kingdom', 'Description', 'kingdom');

// Create currency
const currency = economySystem.createCurrency(economy.id, 'GC', 'Gold Crown', 'Gold Crowns', 1.0, true);

// Create bank
const bank = bankManager.createBank('Bank Name', economy.id);

// Create account
const account = bankManager.createAccount(bank.id, actorId, 'Account Name', currency.id);
```

The framework is ready to use! 🎉

