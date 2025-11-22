# FoundryBank - Complete Features Explanation

## Overview

FoundryBank is a **modular economy framework** for Foundry VTT that lets you create complete economic systems dynamically during your sessions. It's designed to be flexible, extensible, and completely separate from D&D 5e currency unless you explicitly choose to sync.

---

## 🏛️ Core Framework Features

### 1. Economy System

**What it does:** Creates independent economic systems (kingdoms, factions, regions, etc.)

**Features:**
- **Create Economies**: Make as many economies as you need (kingdoms, cities, factions, etc.)
- **Economic Types**: Predefined types (kingdom, faction, region, city, custom)
- **Growth Tracking**: Each economy has its own growth rate (-100% to +100%)
- **Interest Rates**: Base interest rate per economy (affects bank deposits)
- **Active/Inactive**: Enable or disable economies as needed
- **Independent Systems**: Each economy operates completely separately

**Example:**
```javascript
// Create a kingdom economy
const kingdom = economySystem.createEconomy(
  'Kingdom of Eldoria',
  'A prosperous trading kingdom in the north',
  'kingdom',
  0.15,  // 15% economic growth
  0.03   // 3% base interest rate
);
```

**Use Cases:**
- Different kingdoms with different economic conditions
- Faction economies (thieves' guild, merchant guild, etc.)
- Regional economies (north vs south)
- City-specific economies

---

### 2. Currency System

**What it does:** Creates custom currencies for each economy

**Features:**
- **Multiple Currencies**: Each economy can have multiple currencies
- **Base Currency**: One currency per economy marked as "base"
- **Exchange Rates**: Set exchange rates relative to gold pieces (gp)
- **Symbol & Names**: Custom symbols, names, and plural forms
- **Currency Conversion**: Automatic conversion between currencies

**Example:**
```javascript
// Create base currency for kingdom
const goldCrown = economySystem.createCurrency(
  kingdom.id,
  'GC',           // Symbol
  'Gold Crown',   // Name
  'Gold Crowns',  // Plural
  1.0,            // 1 GC = 1 gp
  true            // Is base currency
);

// Create secondary currency
const silverMark = economySystem.createCurrency(
  kingdom.id,
  'SM',
  'Silver Mark',
  'Silver Marks',
  0.1,  // 1 SM = 0.1 gp (10 SM = 1 gp)
  false
);
```

**Use Cases:**
- Kingdom-specific coins (Crowns, Marks, Ducats)
- Faction currencies (Guild Tokens, Favor Points)
- Regional currencies (Northern Coins, Southern Silver)
- Precious metal currencies (Platinum, Gold, Silver, Copper)

---

### 3. Exchange Rate System

**What it does:** Handles currency conversion between any currencies

**Features:**
- **Automatic Conversion**: Converts between any two currencies
- **Bidirectional Rates**: Sets rates in both directions automatically
- **Cross-Economy Trading**: Trade between different economies' currencies
- **Rate Calculation**: Calculates rates via base currencies if direct rate not set
- **Manual Rates**: Set specific exchange rates between currencies

**Example:**
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

**Use Cases:**
- Trading between kingdoms
- Converting faction currency to standard currency
- International trade
- Currency exchange services

---

### 4. Bank System

**What it does:** Creates banks that belong to specific economies

**Features:**
- **Economy-Based**: Banks belong to specific economies
- **Multiple Banks**: Create multiple banks per economy
- **Bank Details**: Name, description, location
- **Active/Inactive**: Enable or disable banks
- **Bank Management**: List banks by economy

**Example:**
```javascript
// Create a bank in the kingdom
const royalBank = bankManager.createBank(
  'Royal Bank of Eldoria',
  kingdom.id,
  'The main bank of the kingdom, located in the capital',
  'Capital City'
);
```

**Use Cases:**
- Different banks in different cities
- Faction banks (thieves' guild bank, merchant bank)
- Regional banks
- Specialized banks (noble bank, commoner bank)

---

### 5. Account System

**What it does:** Creates bank accounts for characters

**Features:**
- **Bank-Linked**: Accounts belong to specific banks
- **Currency-Specific**: Each account uses a currency from the bank's economy
- **Multiple Accounts**: Characters can have multiple accounts
- **Account Names**: Custom names for each account
- **Balance Tracking**: Real-time balance updates
- **D&D 5e Sync**: Optional sync with character inventory

**Example:**
```javascript
// Create account using kingdom currency
const account = bankManager.createAccount(
  royalBank.id,        // Bank
  actorId,             // Character
  'Savings Account',   // Account name
  goldCrown.id,        // Currency
  false                // Don't sync with D&D 5e
);
```

**Use Cases:**
- Savings accounts
- Checking accounts
- Business accounts
- Multiple currency accounts
- Synced accounts (for D&D 5e integration)

---

## 💰 Banking Operations

### 6. Deposits

**What it does:** Add funds to bank accounts

**Features:**
- **Amount Validation**: Ensures positive amounts
- **Balance Updates**: Updates account balance immediately
- **Transaction Logging**: Records all deposits
- **From Inventory**: Option to deposit from D&D 5e character inventory (if synced)
- **Transaction History**: All deposits logged with timestamps

**Example:**
```javascript
// Deposit funds
await bankManager.deposit(
  account.id,
  100,                    // Amount
  'Payment from quest'    // Description
);
```

---

### 7. Withdrawals

**What it does:** Remove funds from bank accounts

**Features:**
- **Balance Validation**: Checks for sufficient funds
- **Amount Validation**: Ensures positive amounts
- **Balance Updates**: Updates account balance immediately
- **Transaction Logging**: Records all withdrawals
- **To Inventory**: Option to withdraw to D&D 5e character inventory (if synced)
- **Transaction History**: All withdrawals logged with timestamps

**Example:**
```javascript
// Withdraw funds
await bankManager.withdraw(
  account.id,
  50,                     // Amount
  'Purchase equipment'    // Description
);
```

---

### 8. Transfers

**What it does:** Move funds between accounts

**Features:**
- **Cross-Account**: Transfer between any two accounts
- **Currency Conversion**: Automatically converts if accounts use different currencies
- **Balance Validation**: Checks for sufficient funds
- **Exchange Rate**: Uses economy system exchange rates
- **Transaction Logging**: Records transfers with conversion details
- **Bidirectional**: Can transfer in either direction

**Example:**
```javascript
// Transfer between accounts (with currency conversion)
await bankManager.transfer(
  fromAccount.id,
  toAccount.id,
  100,                    // Amount
  'Payment to partner'    // Description
);
```

---

## 💵 Interest System

### 9. Interest on Deposits

**What it does:** Automatically calculates and pays interest on account balances

**Features:**
- **Daily Calculation**: Interest calculated daily (real-world time)
- **Configurable Rate**: Set annual interest rate (0% to 50%)
- **Economic Impact**: Interest rates affected by economic growth
- **Automatic Payment**: Interest automatically added to balance
- **Interest Tracking**: Tracks total interest earned per account
- **Transaction Logging**: Interest payments logged as transactions
- **Compound Interest**: Interest calculated on current balance (including previous interest)

**How it works:**
- Interest rate = Base rate + (Economic growth × multiplier)
- Positive economic growth increases interest rates
- Negative growth (recession) decreases rates
- Interest calculated daily and added to balance

**Example:**
- Account with 1000 GC, 3% annual interest
- Daily interest: ~0.008% (3% / 365)
- After 30 days: ~2.47 GC interest earned

---

## 💳 Loan System

### 10. Loan Creation

**What it does:** Create loans for characters with repayment terms

**Features:**
- **Principal Amount**: Original loan amount
- **Interest Rate**: Annual interest rate (typically 2.5× deposit rate)
- **Repayment Schedules**: Daily, weekly, monthly, yearly, or lump sum
- **Loan Terms**: Optional due date (in days)
- **Economic Integration**: Loan rates tied to economic growth
- **Loan Tracking**: Track remaining balance, total paid, status

**Example:**
```javascript
// Create a loan
const loan = loanManager.createLoan(
  actorId,
  1000,        // Principal
  'GC',         // Currency
  0.075,        // 7.5% interest (optional, uses economy rate if not specified)
  365,          // 1 year term
  'monthly',    // Monthly payments
  'Business expansion loan'
);
```

---

### 11. Loan Payments

**What it does:** Make payments on loans

**Features:**
- **Interest Calculation**: Calculates interest accrued since last payment
- **Payment Application**: Applies payment to interest first, then principal
- **Balance Tracking**: Updates remaining balance
- **Payment History**: Tracks total paid
- **Auto-Complete**: Marks loan as "paid" when balance reaches zero
- **Payment Scheduling**: Calculates next payment amount based on schedule

**Example:**
```javascript
// Make a payment
const result = await loanManager.makePayment(
  loan.id,
  100  // Payment amount
);
// Returns: { paid: 100, remaining: 900, interestAccrued: 5.2 }
```

---

### 12. Loan Management

**What it does:** Track and manage loans

**Features:**
- **Loan Status**: Active, paid, or defaulted
- **Payment Schedules**: Calculate next payment based on schedule
- **Interest Accrual**: Tracks interest over time
- **Loan History**: View all loans for a character
- **Active Loans**: Filter to show only active loans
- **Loan Details**: View principal, balance, interest rate, terms

---

## 📈 Stock Market System

### 13. Stock Creation

**What it does:** Create tradeable stocks for investment

**Features:**
- **Stock Symbols**: Custom symbols (e.g., "ELDR", "TRAD")
- **Company Names**: Descriptive company names
- **Initial Price**: Set starting stock price
- **Volatility**: Configure how much prices fluctuate (0.0 to 1.0)
- **Price History**: Maintains price history (last 100 updates)
- **Currency**: Stocks priced in specific currencies

**Example:**
```javascript
// Create a stock
const stock = stockManager.createStock(
  'ELDR',                    // Symbol
  'Eldoria Trading Company',  // Name
  100,                        // Initial price (in GC)
  'GC',                       // Currency
  0.15                        // 15% volatility
);
```

---

### 14. Stock Trading

**What it does:** Buy and sell stock shares

**Features:**
- **Buy Shares**: Purchase shares at current market price
- **Sell Shares**: Sell shares at current market price
- **Portfolio Tracking**: Tracks holdings per character
- **Average Price**: Calculates average purchase price
- **Profit/Loss**: Calculates profit or loss on sales
- **Partial Sales**: Sell some shares while keeping others

**Example:**
```javascript
// Buy stock
const holding = stockManager.buyStock(
  actorId,
  stock.id,
  10  // Buy 10 shares
);

// Sell stock
const result = stockManager.sellStock(
  holding.id,
  5   // Sell 5 shares
);
// Returns: { proceeds: 550, profit: 50 } (if price went up)
```

---

### 15. Dynamic Stock Prices

**What it does:** Stock prices fluctuate based on economic conditions

**Features:**
- **Economic Impact**: Prices affected by economic growth
- **Volatility**: Random price fluctuations based on stock volatility
- **Price Updates**: Prices update based on time and economy
- **Price History**: Maintains historical price data
- **Market Conditions**: Bull market (growth) vs bear market (recession)

**How it works:**
- Positive economic growth → Stock prices increase
- Negative growth (recession) → Stock prices decrease
- Volatility adds random fluctuations
- Prices update periodically

---

## 🌍 Economic Growth System

### 16. Economic Growth Management

**What it does:** Control economic conditions that affect all financial systems

**Features:**
- **Growth Rate**: Set growth from -100% (recession) to +100% (boom)
- **Interest Impact**: Growth affects deposit and loan interest rates
- **Stock Impact**: Growth affects stock prices
- **Per-Economy**: Each economy has its own growth rate
- **Dynamic Updates**: Can be updated anytime by GM

**Effects:**
- **Positive Growth**: Higher interest rates, rising stock prices
- **Negative Growth**: Lower interest rates, falling stock prices
- **Neutral (0%)**: Base rates apply

**Example:**
```javascript
// Set economic growth
economyManager.updateEconomicGrowth(0.15); // 15% growth

// Effects:
// - Interest rates increase
// - Stock prices rise
// - Loan rates increase
```

---

## 🎲 D&D 5e Integration

### 17. Currency Sync (Optional)

**What it does:** Optionally sync bank accounts with D&D 5e character currency

**Features:**
- **Optional Per Account**: Each account can choose to sync or not
- **Automatic Sync**: Bank balance syncs with character inventory
- **Deposit from Inventory**: Remove currency from character when depositing
- **Withdraw to Inventory**: Add currency to character when withdrawing
- **System Detection**: Automatically detects D&D 5e system
- **Currency Mapping**: Maps bank currency to D&D 5e currency (pp, gp, ep, sp, cp)

**Important:** 
- **D&D 5e currency is NEVER touched unless you explicitly sync an account**
- Your custom economies/currencies are completely separate
- Sync is opt-in, not automatic

**Example:**
```javascript
// Create synced account
const syncedAccount = bankManager.createAccount(
  bankId,
  actorId,
  'Main Account',
  dnd5eGpCurrencyId,
  true  // Enable sync
);

// Deposit from character inventory
await bankManager.depositFromActorCurrency(syncedAccount.id, 100);
// Removes 100 gp from character, adds to bank

// Withdraw to character inventory
await bankManager.withdrawToActorCurrency(syncedAccount.id, 50);
// Removes 50 gp from bank, adds to character
```

---

## 📊 Transaction System

### 18. Transaction History

**What it does:** Complete audit trail of all financial transactions

**Features:**
- **All Transactions**: Deposits, withdrawals, transfers, interest, exchanges
- **Transaction Details**: Amount, currency, description, timestamp
- **Account History**: View transactions per account
- **Actor History**: View all transactions for a character
- **Transaction Limits**: Configurable history limit (10-1000 transactions)
- **Transaction Types**: Deposit, withdrawal, transfer, exchange, interest

**Transaction Information:**
- Transaction ID
- Account ID
- Actor ID
- Type (deposit/withdrawal/transfer/exchange)
- Amount
- Currency ID
- Description
- Timestamp
- Exchange rate (if currency conversion)
- Exchanged amount (if converted)

---

## ⚙️ Settings & Configuration

### 19. Module Settings

**What it does:** Configure module behavior

**Settings:**
- **Default Currency**: Default currency for new accounts
- **Interest Rate**: Annual interest rate (0% to 50%)
- **Enable Interest**: Toggle interest calculation on/off
- **Enable Logging**: Toggle transaction logging
- **Transaction History Limit**: Max transactions to keep (10-1000)
- **Enable Shift+Click**: Toggle token shortcut
- **Enable D&D 5e Sync**: Toggle D&D 5e currency sync feature
- **Economic Growth Rate**: Set global economic growth (-100% to +100%)

---

## 🎮 User Interface Features

### 20. Token Integration

**What it does:** Easy access to banking from tokens

**Features:**
- **Shift+Click**: Hold Shift and click token to open bank
- **Token HUD Button**: Bank icon in token HUD controls
- **Actor Validation**: Checks for associated actor
- **Quick Access**: Fast access to character banking

---

### 21. Bank Dialog

**What it does:** Main banking interface

**Features:**
- **Account List**: View all accounts for character
- **Account Selection**: Click to select and view details
- **Account Details**: View balance, currency, transactions
- **Quick Actions**: Deposit, withdraw, transfer buttons
- **Transaction History**: View recent transactions
- **Account Management**: Create, delete accounts
- **Responsive Design**: Works on different screen sizes

---

## 🔌 API & Hooks

### 22. Module API

**What it does:** Expose managers for other modules

**Available Managers:**
- `getBankManager()` - Banking operations
- `getEconomySystem()` - Economy and currency management
- `getEconomyManager()` - Economic growth and interest
- `getLoanManager()` - Loan operations
- `getStockManager()` - Stock market operations

---

### 23. Hooks System

**What it does:** Events for other modules to listen to

**Available Hooks:**
- `foundrybank.transaction` - Fired on any transaction
- `foundrybank.interestPaid` - Fired when interest is paid
- `foundrybank.economyCreated` - Fired when economy is created
- `foundrybank.currencyCreated` - Fired when currency is created
- `foundrybank.bankCreated` - Fired when bank is created
- `foundrybank.accountCreated` - Fired when account is created
- `foundrybank.loanCreated` - Fired when loan is created
- `foundrybank.loanPayment` - Fired on loan payment
- `foundrybank.loanPaid` - Fired when loan is fully paid
- `foundrybank.stockCreated` - Fired when stock is created
- `foundrybank.stockPurchased` - Fired on stock purchase
- `foundrybank.stockSold` - Fired on stock sale
- `foundrybank.stockPricesUpdated` - Fired when stock prices update
- `foundrybank.economyUpdate` - Fired when economy is updated
- `foundrybank.exchangeRateUpdated` - Fired when exchange rate is set

---

## 🎯 Use Case Examples

### Example 1: Kingdom Economy
1. Create "Kingdom of Eldoria" economy
2. Create "Gold Crown" currency (1 GC = 1 gp)
3. Create "Royal Bank" in the kingdom
4. Players open accounts and deposit Gold Crowns
5. Interest accrues daily
6. Players can take loans
7. Stock market available for investments

### Example 2: Faction Economy
1. Create "Thieves' Guild" economy
2. Create "Guild Token" currency (1 Token = 0.5 gp)
3. Create "Guild Vault" bank
4. Members use Guild Tokens for transactions
5. Exchange rates set for trading with standard currency

### Example 3: Multi-Economy Campaign
1. Create multiple kingdom economies
2. Each has its own currency
3. Set exchange rates between kingdoms
4. Players trade between economies
5. Economic growth affects each kingdom differently
6. D&D 5e currency remains untouched

---

## 🔒 Safety Features

- **D&D 5e Protection**: Never touches D&D 5e currency unless explicitly synced
- **Balance Validation**: Prevents negative balances
- **Amount Validation**: Ensures positive amounts
- **Currency Validation**: Validates currency exists
- **Account Validation**: Validates accounts exist
- **Transaction Logging**: Complete audit trail
- **Error Handling**: Proper error messages

---

## 📝 Summary

FoundryBank provides a **complete, modular economic framework** that lets you:
- Create economies dynamically
- Create custom currencies
- Create banks and accounts
- Handle deposits, withdrawals, transfers
- Calculate interest automatically
- Manage loans
- Trade stocks
- Control economic growth
- Exchange between currencies
- Optionally sync with D&D 5e (if desired)

All while keeping D&D 5e currency completely separate and safe!

