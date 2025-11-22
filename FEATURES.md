# FoundryBank - Complete Feature List

## ✅ Implemented Features

### Core Banking System
- ✅ **Multiple Bank Accounts**: Create unlimited accounts per character
- ✅ **Deposits & Withdrawals**: Full transaction support
- ✅ **Account Transfers**: Transfer funds between accounts
- ✅ **Transaction History**: Complete audit trail with timestamps
- ✅ **Multiple Currencies**: Support for gp, sp, cp, pp, ep

### Interest System
- ✅ **Automatic Interest Calculation**: Daily interest on deposits
- ✅ **Configurable Interest Rates**: GM can set annual interest rate (0-50%)
- ✅ **Economic Growth Integration**: Interest rates affected by economic growth
- ✅ **Interest Tracking**: Track total interest earned per account
- ✅ **Interest Transactions**: Interest payments logged as transactions

### Loans System
- ✅ **Loan Creation**: Create loans with principal, interest rate, and terms
- ✅ **Repayment Schedules**: Daily, weekly, monthly, yearly, or lump sum
- ✅ **Interest Calculation**: Automatic interest accrual on loans
- ✅ **Payment Tracking**: Track payments and remaining balance
- ✅ **Economic Integration**: Loan rates tied to economic growth
- ✅ **Loan Status**: Active, paid, or defaulted status tracking

### Stock Market
- ✅ **Stock Creation**: Create custom stocks with symbols and names
- ✅ **Dynamic Pricing**: Stock prices fluctuate based on economic growth
- ✅ **Volatility System**: Each stock has configurable volatility
- ✅ **Buy/Sell Shares**: Purchase and sell stock shares
- ✅ **Portfolio Tracking**: Track holdings, average price, and profit
- ✅ **Price History**: Maintain price history for each stock
- ✅ **Economic Impact**: Stock prices affected by economic growth rate

### Economic Growth System
- ✅ **Growth Rate Management**: GM can set economic growth (-100% to +100%)
- ✅ **Interest Rate Calculation**: Interest rates adjust based on growth
- ✅ **Stock Price Impact**: Stock prices affected by economic conditions
- ✅ **Loan Rate Calculation**: Loan interest rates tied to economy

### D&D 5e Integration
- ✅ **Currency Sync**: Sync bank accounts with D&D 5e character currency
- ✅ **Automatic Sync**: Bank balance syncs with actor currency (pp, gp, ep, sp, cp)
- ✅ **Deposit from Inventory**: Deposit directly from character inventory
- ✅ **Withdraw to Inventory**: Withdraw directly to character inventory
- ✅ **System Detection**: Automatically detects D&D 5e system

### User Interface
- ✅ **Bank Dialog**: Main banking interface with account management
- ✅ **Token Integration**: Shift+Click on tokens to open bank
- ✅ **Token HUD Button**: Bank icon in token HUD
- ✅ **Transaction Forms**: Separate dialogs for deposits, withdrawals, transfers
- ✅ **Responsive Design**: Works on different screen sizes
- ✅ **Modern Styling**: Clean, professional UI matching Foundry VTT theme

### Settings & Configuration
- ✅ **Module Settings**: Comprehensive settings panel
- ✅ **Interest Rate Control**: Configure annual interest rates
- ✅ **Economic Growth Control**: Set economic growth rate
- ✅ **Currency Sync Toggle**: Enable/disable D&D 5e sync
- ✅ **Transaction Logging**: Toggle transaction history
- ✅ **Shift+Click Toggle**: Enable/disable token shortcut

### API & Hooks
- ✅ **Module API**: Expose managers for other modules
- ✅ **Transaction Hooks**: `foundrybank.transaction`
- ✅ **Interest Hooks**: `foundrybank.interestPaid`
- ✅ **Loan Hooks**: `foundrybank.loanCreated`, `foundrybank.loanPayment`, `foundrybank.loanPaid`
- ✅ **Stock Hooks**: `foundrybank.stockCreated`, `foundrybank.stockPurchased`, `foundrybank.stockSold`, `foundrybank.stockPricesUpdated`
- ✅ **Economy Hooks**: `foundrybank.economyUpdate`

## 🔄 How It Works

### Interest System
1. Interest is calculated daily (in real-world time)
2. Interest rate is configurable (default 2% annual)
3. Economic growth affects interest rates
4. Interest is automatically added to account balance
5. Interest payments are logged as transactions

### Loans System
1. GM or players can create loans
2. Loans have principal, interest rate, and repayment schedule
3. Interest accrues daily on remaining balance
4. Payments reduce principal and accrued interest
5. Loan rates are typically 2.5x deposit interest rates

### Stock Market
1. GM creates stocks with initial price and volatility
2. Stock prices update based on economic growth
3. Players can buy/sell shares
4. Portfolio tracks average purchase price and profit
5. Prices fluctuate with economic conditions and random volatility

### D&D 5e Currency Integration
1. When creating an account, enable "Sync with Character Currency"
2. Bank balance automatically syncs with actor's currency
3. Deposits remove currency from character inventory
4. Withdrawals add currency to character inventory
5. Works seamlessly with D&D 5e's currency system

### Economic Growth
1. GM sets economic growth rate (-1.0 to 1.0)
2. Positive growth increases interest rates and stock prices
3. Negative growth (recession) decreases rates and prices
4. Growth affects all financial systems simultaneously

## 📋 Usage Examples

### Creating a Loan
```javascript
const loanManager = game.foundrybank.getLoanManager();
const loan = loanManager.createLoan(
  actorId,
  1000, // principal
  'gp', // currency
  0.05, // 5% interest rate (optional, uses economy rate if not specified)
  365, // 1 year term in days
  'monthly', // payment schedule
  'Business expansion loan'
);
```

### Buying Stock
```javascript
const stockManager = game.foundrybank.getStockManager();
const holding = stockManager.buyStock(actorId, stockId, 10); // Buy 10 shares
```

### Setting Economic Growth
```javascript
const economyManager = game.foundrybank.getEconomyManager();
economyManager.updateEconomicGrowth(0.15); // 15% growth
```

### Depositing from D&D 5e Inventory
```javascript
const bankManager = game.foundrybank.getBankManager();
await bankManager.depositFromActorCurrency(accountId, 100); // Deposits 100 gp from character
```

## 🎯 Comparison with Financial System Module

This module implements all the core features of the Financial System module:
- ✅ Banking and accounts
- ✅ Interest on deposits
- ✅ Loans with repayment
- ✅ Stock market
- ✅ Economic growth system
- ✅ D&D 5e currency integration

Plus additional features:
- ✅ More granular control over interest rates
- ✅ Multiple payment schedules for loans
- ✅ Stock volatility system
- ✅ Automatic interest calculation
- ✅ Comprehensive transaction logging

