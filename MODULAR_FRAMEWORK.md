# FoundryBank - Modular Economy Framework

## Overview

FoundryBank is now a **modular economy framework** that lets you create economies, currencies, and banks dynamically during your session. It's designed to be flexible and extensible without being over-engineered.

## Core Concept

**You create economies, not banks.** Each economy can have:
- Multiple currencies
- Multiple banks
- Exchange rates between currencies
- Economic growth that affects interest rates

**D&D 5e currency remains completely separate** - it's never touched unless you explicitly sync an account.

## Framework Structure

### 1. Economy System
The foundation - create economies (kingdoms, factions, regions, etc.)

```javascript
const economySystem = game.foundrybank.getEconomySystem();

// Create a kingdom economy
const kingdomEconomy = economySystem.createEconomy(
  'Kingdom of Eldoria',
  'A prosperous trading kingdom',
  'kingdom',
  0.15, // 15% growth
  0.03  // 3% base interest
);
```

### 2. Currency System
Each economy can have multiple currencies

```javascript
// Create the base currency for the kingdom
const goldCrown = economySystem.createCurrency(
  kingdomEconomy.id,
  'GC',           // Symbol
  'Gold Crown',   // Name
  'Gold Crowns',  // Plural
  1.0,            // Exchange rate to gp (1 GC = 1 gp)
  true            // Is base currency
);

// Create a secondary currency
const silverMark = economySystem.createCurrency(
  kingdomEconomy.id,
  'SM',
  'Silver Mark',
  'Silver Marks',
  0.1,  // 1 SM = 0.1 gp (10 SM = 1 gp)
  false
);
```

### 3. Bank System
Banks belong to economies and use that economy's currencies

```javascript
const bankManager = game.foundrybank.getBankManager();

// Create a bank in the kingdom
const royalBank = bankManager.createBank(
  'Royal Bank of Eldoria',
  kingdomEconomy.id,
  'The main bank of the kingdom',
  'Capital City'
);
```

### 4. Account System
Accounts belong to banks and use currencies from that economy

```javascript
// Create an account using the kingdom's currency
const account = bankManager.createAccount(
  royalBank.id,        // Bank
  actorId,            // Character
  'Savings Account',   // Account name
  goldCrown.id,       // Currency (from economy)
  false                // Don't sync with D&D 5e currency
);
```

## Currency Exchange

Currencies can be exchanged between economies:

```javascript
// Set exchange rate: 1 Gold Crown = 2 D&D 5e Gold Pieces
economySystem.setExchangeRate(
  goldCrown.id,
  dnd5eGpCurrencyId,
  2.0
);

// Convert currency
const amount = economySystem.convertCurrency(
  100,              // 100 Gold Crowns
  goldCrown.id,     // From
  dnd5eGpCurrencyId // To
); // Returns 200 gp
```

## D&D 5e Integration (Optional)

D&D 5e currency is **completely separate** by default. To sync:

```javascript
// Create account with sync enabled
const syncedAccount = bankManager.createAccount(
  bankId,
  actorId,
  'Main Account',
  dnd5eGpCurrencyId,
  true  // Sync with D&D 5e currency
);

// Now deposits/withdrawals sync with character inventory
await bankManager.depositFromActorCurrency(syncedAccount.id, 100);
await bankManager.withdrawToActorCurrency(syncedAccount.id, 50);
```

## Workflow Example

### Creating a Kingdom Economy in Session

1. **Create the Economy**
   ```javascript
   const economy = economySystem.createEconomy('My Kingdom', 'Description', 'kingdom');
   ```

2. **Create Currencies**
   ```javascript
   const gold = economySystem.createCurrency(economy.id, 'GC', 'Gold Crown', 'Gold Crowns', 1.0, true);
   const silver = economySystem.createCurrency(economy.id, 'SM', 'Silver Mark', 'Silver Marks', 0.1);
   ```

3. **Create Banks**
   ```javascript
   const bank = bankManager.createBank('Royal Bank', economy.id);
   ```

4. **Create Accounts**
   ```javascript
   const account = bankManager.createAccount(bank.id, actorId, 'Account', gold.id);
   ```

5. **Use It!**
   - Players can deposit/withdraw in kingdom currency
   - Exchange rates handle conversions
   - D&D 5e currency untouched unless explicitly synced

## Key Features

✅ **Modular**: Create economies as needed, no pre-configuration  
✅ **Flexible**: Each economy independent with own currencies  
✅ **Exchange Rates**: Trade between any currencies  
✅ **D&D 5e Safe**: Never touches D&D 5e currency unless you sync  
✅ **Session-Ready**: Create everything dynamically during play  
✅ **Extensible**: Add banks, currencies, economies anytime  

## API Reference

### EconomySystem
- `createEconomy(name, description, type, growthRate, baseInterestRate)`
- `getEconomy(economyId)`
- `getAllEconomies()`
- `createCurrency(economyId, symbol, name, pluralName, exchangeRate, isBaseCurrency)`
- `getCurrency(currencyId)`
- `getEconomyCurrencies(economyId)`
- `setExchangeRate(fromCurrencyId, toCurrencyId, rate)`
- `getExchangeRate(fromCurrencyId, toCurrencyId)`
- `convertCurrency(amount, fromCurrencyId, toCurrencyId)`

### BankManager
- `createBank(name, economyId, description, location)`
- `getBank(bankId)`
- `getEconomyBanks(economyId)`
- `createAccount(bankId, actorId, accountName, currencyId, syncWithActorCurrency)`
- `getActorAccounts(actorId)`
- `getBankAccounts(bankId)`

## Design Philosophy

**Keep it simple, make it modular.**

- No pre-configured banks or currencies
- Create what you need, when you need it
- Each economy is independent
- D&D 5e currency is a separate economy (created by default)
- Exchange rates handle all conversions
- Banks belong to economies, accounts belong to banks

This gives you the framework to build any economic system you want, without forcing you into a specific structure.

