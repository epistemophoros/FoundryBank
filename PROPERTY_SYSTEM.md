# Property & Asset System

## Overview

The Property System allows players to purchase, own, and manage properties (real estate, businesses, land, ships, vehicles, etc.) through banks. Properties have values stored in specific currencies and can generate income or incur expenses.

## Features

### Property Types
- **Real Estate**: Houses, buildings, estates
- **Business**: Shops, taverns, trading posts
- **Land**: Plots, farms, territories
- **Ship**: Vessels, boats
- **Vehicle**: Wagons, carriages, mounts
- **Equipment**: Special items, machinery
- **Custom**: Any other asset type

### Core Functionality
- ✅ **Purchase Properties**: Buy through banks using account funds
- ✅ **Store Values**: Properties have purchase price and current market value
- ✅ **Currency Support**: Properties priced in any currency (e.g., AXT)
- ✅ **Ownership Tracking**: Track who owns each property
- ✅ **Value Tracking**: Current value can differ from purchase price
- ✅ **Income/Expenses**: Properties can generate income or require maintenance
- ✅ **Transaction History**: All property transactions logged
- ✅ **Bank Integration**: Properties can be sold through specific banks

## Usage Example: Aexorian Royal Bank

### Scenario
A player wants to buy a property at Aexorian Royal Bank for 1000 AXT (Aexorian currency, worth 10,000 platinum).

### Step 1: Create the Economy & Currency
```javascript
const economySystem = game.foundrybank.getEconomySystem();
const propertyManager = game.foundrybank.getPropertyManager();
const bankManager = game.foundrybank.getBankManager();

// Create Aexorian economy
const aexorianEconomy = economySystem.createEconomy(
  'Aexorian Kingdom',
  'The prosperous Aexorian kingdom',
  'kingdom'
);

// Create AXT currency (1 AXT = 10 platinum = 100 gp)
const axtCurrency = economySystem.createCurrency(
  aexorianEconomy.id,
  'AXT',
  'Aexorian Token',
  'Aexorian Tokens',
  100.0,  // 1 AXT = 100 gp = 10 pp
  true    // Base currency
);
```

### Step 2: Create the Bank
```javascript
// Create Aexorian Royal Bank
const aexorianBank = bankManager.createBank(
  'Aexorian Royal Bank',
  aexorianEconomy.id,
  'The royal bank of Aexoria',
  'Capital City'
);
```

### Step 3: Create the Property
```javascript
// Create a property for sale
const property = propertyManager.createProperty(
  'Grand Estate in Capital District',
  'A luxurious estate with gardens and servants quarters',
  'real_estate',
  aexorianEconomy.id,
  1000,              // Purchase price: 1000 AXT
  axtCurrency.id,    // Currency: AXT
  aexorianBank.id,   // Sold through Aexorian Royal Bank
  'Capital District, Aexoria',
  50,                // Monthly income: 50 AXT (rent)
  10                 // Monthly expenses: 10 AXT (maintenance)
);
```

### Step 4: Player Purchases Property
```javascript
// Player has account with 1000 AXT
const account = bankManager.getActorAccounts(actorId)[0];

// Purchase property (withdraws from account automatically)
const transaction = await propertyManager.purchaseProperty(
  property.id,
  actorId,
  account.id,
  1000,           // Purchase price (can override listed price)
  bankManager     // BankManager instance for automatic withdrawal
);

// Property is now owned by the player
// Account balance automatically reduced by 1000 AXT
// Property value stored: 1000 AXT
// Transaction logged in both property and bank systems
```

### Step 5: Track Property Value
```javascript
// Property value can be updated (market changes, improvements, etc.)
propertyManager.updatePropertyValue(
  property.id,
  1200  // New value: 1200 AXT (appreciated)
);

// Get property details
const ownedProperty = propertyManager.getProperty(property.id);
console.log(ownedProperty.currentValue); // 1200 AXT
console.log(ownedProperty.ownerId);      // actorId
```

## Property Management

### View Player's Properties
```javascript
// Get all properties owned by a player
const playerProperties = propertyManager.getActorProperties(actorId);

// Calculate total property value
const totalValue = propertyManager.calculateActorPropertyValue(actorId, axtCurrency.id);
```

### Property Income & Expenses
```javascript
// Record income from property (rent, business profit, etc.)
propertyManager.recordIncome(
  property.id,
  50,                    // 50 AXT income
  'Monthly rent payment'
);

// Record expenses (maintenance, taxes, etc.)
propertyManager.recordExpense(
  property.id,
  10,                    // 10 AXT expense
  'Monthly maintenance'
);
```

### Sell Property
```javascript
// Sell property back to market
const saleTransaction = await propertyManager.sellProperty(
  property.id,
  actorId,
  1200,                  // Sale price: 1200 AXT
  account.id,            // Account to receive proceeds
  bankManager            // BankManager instance for automatic deposit
);

// Property becomes available again
// Sale proceeds automatically deposited to account
// Transaction logged in both property and bank systems
```

## Property Features

### Value Storage
- **Purchase Price**: Original purchase amount (stored)
- **Current Value**: Current market value (can be updated)
- **Currency**: Value stored in specific currency (e.g., AXT)
- **Value Tracking**: Tracks value changes over time

### Ownership
- **Owner ID**: Tracks which actor owns the property
- **Purchase Date**: When property was purchased
- **Status**: Available, owned, rented, maintenance, sold

### Financials
- **Income**: Optional income generation (rent, business profit)
- **Expenses**: Optional maintenance costs
- **Net Profit**: Income - Expenses

### Bank Integration
- **Bank-Linked**: Properties can be sold through specific banks
- **Account Integration**: Purchase/sale uses bank accounts
- **Currency Matching**: Properties use currencies from the bank's economy

## Property Types Explained

### Real Estate
- Houses, buildings, estates
- Can generate rental income
- May require maintenance

### Business
- Shops, taverns, trading posts
- Can generate business profit
- May have operating expenses

### Land
- Plots, farms, territories
- Can generate agricultural income
- May require upkeep

### Ship
- Vessels, boats
- Can generate shipping income
- Requires maintenance

### Vehicle
- Wagons, carriages, mounts
- May reduce travel costs
- Requires maintenance

### Equipment
- Special items, machinery
- May provide benefits
- May require maintenance

## API Reference

### PropertyManager Methods

```javascript
// Create property
createProperty(name, description, type, economyId, purchasePrice, currencyId, bankId?, location?, income?, expenses?)

// Get properties
getAllProperties()
getEconomyProperties(economyId)
getBankProperties(bankId)
getAvailableProperties(economyId?)
getActorProperties(actorId)
getProperty(propertyId)

// Purchase/Sell
purchaseProperty(propertyId, actorId, accountId, purchasePrice?)
sellProperty(propertyId, actorId, salePrice, toAccountId?)

// Value Management
updatePropertyValue(propertyId, newValue)
updatePropertyFinancials(propertyId, income?, expenses?)

// Transactions
recordIncome(propertyId, amount, description?)
recordExpense(propertyId, amount, description?)
getPropertyTransactions(propertyId)
getActorPropertyTransactions(actorId)

// Calculations
calculateActorPropertyValue(actorId, currencyId?)

// Management
deleteProperty(propertyId)
```

## Hooks

- `foundrybank.propertyCreated` - Fired when property is created
- `foundrybank.propertyPurchased` - Fired when property is purchased
- `foundrybank.propertySold` - Fired when property is sold
- `foundrybank.propertyValueUpdated` - Fired when value is updated
- `foundrybank.propertyFinancialsUpdated` - Fired when income/expenses updated
- `foundrybank.propertyIncome` - Fired when income is recorded
- `foundrybank.propertyExpense` - Fired when expense is recorded
- `foundrybank.propertyDeleted` - Fired when property is deleted

## Example: Complete Property Purchase Flow

```javascript
// 1. Setup
const economySystem = game.foundrybank.getEconomySystem();
const propertyManager = game.foundrybank.getPropertyManager();
const bankManager = game.foundrybank.getBankManager();

// 2. Create economy, currency, bank
const economy = economySystem.createEconomy('Aexoria', 'Description', 'kingdom');
const currency = economySystem.createCurrency(economy.id, 'AXT', 'Aexorian Token', 'Aexorian Tokens', 100.0, true);
const bank = bankManager.createBank('Aexorian Royal Bank', economy.id);

// 3. Create property
const property = propertyManager.createProperty(
  'Grand Estate',
  'Luxury estate',
  'real_estate',
  economy.id,
  1000,        // 1000 AXT = 10,000 platinum
  currency.id,
  bank.id
);

// 4. Player purchases (from their account)
const account = bankManager.getActorAccounts(actorId)[0]; // Account with 1000+ AXT
await propertyManager.purchaseProperty(property.id, actorId, account.id);

// 5. Property is now owned, value stored as 1000 AXT
// Account balance reduced by 1000 AXT
// Property can generate income, incur expenses, be sold, etc.
```

## Summary

✅ **Properties can be purchased through banks**  
✅ **Values stored in specific currencies** (e.g., 1000 AXT)  
✅ **Properties belong to economies**  
✅ **Properties can be linked to banks**  
✅ **Full ownership tracking**  
✅ **Value management** (purchase price, current value)  
✅ **Income/expense tracking**  
✅ **Transaction history**  
✅ **Bank account integration**  

The property system is fully integrated with the banking and economy framework!

