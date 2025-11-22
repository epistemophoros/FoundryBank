# FoundryBank System Architecture Flowchart

## Module Initialization Flow

```
[Foundry VTT Starts]
    ↓
[Hooks.once('init')]
    ↓
[FoundryBank.init()]
    ↓
    ├─→ [registerHandlebarsHelpers()]
    ├─→ [EconomySystem.initialize()]
    │   └─→ Load economyData from settings
    │   └─→ Create default D&D 5e economy
    ├─→ [EconomyManager.initialize()]
    │   └─→ Load economicState from settings
    ├─→ [BankManager.initialize()]
    │   └─→ Load bankData from settings
    │   └─→ Start interest calculation interval
    ├─→ [LoanManager.initialize()]
    │   └─→ Load loanData from settings
    ├─→ [StockManager.initialize()]
    │   └─→ Load stockData from settings
    │   └─→ Update stock prices
    ├─→ [PropertyManager.initialize()]
    │   └─→ Load propertyData from settings
    ├─→ [BankerSystem.initialize()]
    │   └─→ Load bankerData from settings
    └─→ [BankSettings.register()]
        └─→ Register all module settings
```

## System Relationships Flow

```
[EconomySystem]
    ↓ creates/manages
[Economy] (kingdom, faction, etc.)
    ↓ has
[Currency] (AXT, GC, etc.)
    ↓ uses
[ExchangeRate] (between currencies)
    ↓
[BankManager]
    ↓ creates/manages
[Bank] (belongs to Economy)
    ↓ uses
[Currency] (from Economy)
    ↓ has
[BankAccount] (belongs to Bank)
    ↓ uses
[Currency] (from Economy)
    ↓
[PropertyManager]
    ↓ creates/manages
[Property] (belongs to Economy)
    ↓ uses
[Currency] (from Economy)
    ↓ linked to
[Bank] (optional)
```

## Player Interaction Flow

```
[Player Clicks Token]
    ↓
[Is Banker?]
    ├─→ YES → [BankerSystem.getBanker()]
    │   └─→ Get bankId
    │   └─→ [BankManager.getBank()]
    │   └─→ [openBankDialogFromBanker()]
    │       └─→ Show greeting
    │       └─→ Open BankDialog for player's character
    │
    └─→ NO → [Shift+Click Enabled?]
        ├─→ YES → [openBankDialog()]
        │   └─→ Open BankDialog for token's actor
        └─→ NO → (No action)
```

## Bank Dialog Flow

```
[BankDialog Opens]
    ↓
[BankManager.getActorAccounts()]
    ↓
[Display Accounts List]
    ↓
[Player Selects Account]
    ↓
[Display Account Details]
    ├─→ Balance
    ├─→ Currency
    ├─→ Interest earned
    └─→ Transaction history
    ↓
[Player Action]
    ├─→ [Deposit]
    │   └─→ [BankManager.deposit()]
    │       └─→ Update account balance
    │       └─→ Create transaction
    │       └─→ Save data
    │
    ├─→ [Withdraw]
    │   └─→ [BankManager.withdraw()]
    │       └─→ Check balance
    │       └─→ Update account balance
    │       └─→ Create transaction
    │       └─→ Save data
    │
    ├─→ [Transfer]
    │   └─→ [BankManager.transfer()]
    │       └─→ Check currencies
    │       └─→ [EconomySystem.getExchangeRate()] (if different)
    │       └─→ Convert currency
    │       └─→ Update both accounts
    │       └─→ Create transaction
    │       └─→ Save data
    │
    └─→ [Create Account]
        └─→ [BankManager.createAccount()]
            └─→ Requires bankId
            └─→ Requires currencyId
            └─→ Create account
            └─→ Save data
```

## Property Purchase Flow

```
[Player Wants to Buy Property]
    ↓
[PropertyManager.purchaseProperty()]
    ↓
[Check Property Status]
    ├─→ Available? → Continue
    └─→ Not Available → Error
    ↓
[BankManager.getAccount()]
    ↓
[Check Account Balance]
    ├─→ Sufficient? → Continue
    └─→ Insufficient → Error
    ↓
[Check Currency Match]
    ├─→ Same Currency? → Direct withdrawal
    └─→ Different Currency? → [EconomySystem.getExchangeRate()]
        └─→ Convert amount
        └─→ Withdraw converted amount
    ↓
[BankManager.withdraw()]
    ↓
[Update Property]
    ├─→ Set ownerId
    ├─→ Set status to 'owned'
    ├─→ Set purchasePrice
    └─→ Set currentValue
    ↓
[Create PropertyTransaction]
    ↓
[Save Data]
```

## Interest Calculation Flow

```
[Interest Calculation Interval (Hourly)]
    ↓
[BankManager.calculateAllInterest()]
    ↓
[For Each Account]
    ├─→ [Check Balance > 0]
    │   └─→ NO → Skip
    │   └─→ YES → Continue
    ↓
[Calculate Days Since Last Interest]
    ├─→ < 1 day? → Skip
    └─→ ≥ 1 day? → Continue
    ↓
[Get Interest Rate]
    ├─→ From settings OR
    └─→ [EconomyManager.getInterestRate()]
        └─→ Base rate + (growth rate × multiplier)
    ↓
[Calculate Interest]
    └─→ balance × rate × (days / 365)
    ↓
[Update Account]
    ├─→ Add interest to balance
    ├─→ Update interestEarned
    └─→ Update lastInterestCalculation
    ↓
[Create Interest Transaction]
    ↓
[Save Data]
```

## GM Manager Flow

```
[GM Opens GM Manager]
    ↓
[GMManagerDialog Renders]
    ↓
[Load All Data]
    ├─→ [EconomySystem.getAllEconomies()]
    ├─→ [BankManager.getAllBanks()]
    ├─→ [PropertyManager.getAllProperties()]
    ├─→ [StockManager.getAllStocks()]
    ├─→ [BankerSystem.getAllBankers()]
    └─→ [EconomyManager.getEconomicState()]
    ↓
[Display in Tabs]
    ├─→ Economies Tab
    ├─→ Banks Tab
    ├─→ Properties Tab
    ├─→ Stocks Tab
    ├─→ Economy Tab
    └─→ Bankers Tab
    ↓
[GM Action]
    ├─→ Create Economy
    │   └─→ [EconomySystem.createEconomy()]
    │       └─→ Save to economyData
    │
    ├─→ Create Currency
    │   └─→ [EconomySystem.createCurrency()]
    │       └─→ Save to economyData
    │
    ├─→ Create Bank
    │   └─→ [BankManager.createBank()]
    │       └─→ Save to bankData
    │
    ├─→ Create Property
    │   └─→ [PropertyManager.createProperty()]
    │       └─→ Save to propertyData
    │
    ├─→ Create Stock
    │   └─→ [StockManager.createStock()]
    │       └─→ Save to stockData
    │
    ├─→ Register Banker
    │   └─→ [BankerSystem.registerBanker()]
    │       └─→ Set actor flags
    │       └─→ Save to bankerData
    │
    └─→ Update Economic Growth
        └─→ [EconomyManager.updateEconomicGrowth()]
            └─→ Affects interest rates
            └─→ Affects stock prices
```

## Currency Exchange Flow

```
[Player Wants to Exchange Currency]
    ↓
[EconomySystem.getExchangeRate(fromCurrencyId, toCurrencyId)]
    ↓
[Check Direct Rate]
    ├─→ Exists? → Return rate
    └─→ Not exists? → Calculate via base currencies
        ↓
        [Get From Currency]
        └─→ Get exchangeRate to gp
        ↓
        [Get To Currency]
        └─→ Get exchangeRate to gp
        ↓
        [Calculate]
        └─→ fromToGp × (1 / toToGp)
        ↓
        [Return Calculated Rate]
    ↓
[Convert Amount]
    └─→ amount × exchangeRate
```

## Loan System Flow

```
[Create Loan]
    ↓
[LoanManager.createLoan()]
    ├─→ Principal amount
    ├─→ Interest rate (or use economy rate)
    ├─→ Payment schedule
    └─→ Term (optional)
    ↓
[Save Loan]
    ↓
[Player Makes Payment]
    ↓
[LoanManager.makePayment()]
    ↓
[Calculate Interest Accrued]
    └─→ balance × rate × (days / 365)
    ↓
[Apply Interest to Balance]
    ↓
[Apply Payment]
    ├─→ Reduce balance
    └─→ Update totalPaid
    ↓
[Check if Paid Off]
    ├─→ Balance ≤ 0? → Mark as 'paid'
    └─→ Balance > 0? → Continue
    ↓
[Save Data]
```

## Stock Trading Flow

```
[Player Buys Stock]
    ↓
[StockManager.buyStock()]
    ↓
[Get Stock Current Price]
    ↓
[Check Existing Holding]
    ├─→ Exists? → Update holding
    │   └─→ Recalculate average price
    └─→ Not exists? → Create new holding
    ↓
[Save Holding]
    ↓
[Stock Price Updates]
    ↓
[StockManager.updateStockPrices()]
    ↓
[For Each Stock]
    ├─→ Get economic growth rate
    ├─→ Calculate growth factor
    ├─→ Calculate volatility factor
    └─→ Update currentPrice
    ↓
[Update Price History]
    └─→ Keep last 100 entries
    ↓
[Save Data]
```

## Data Storage Flow

```
[Any System Action]
    ↓
[Update Data in Memory]
    ↓
[Save to Foundry Settings]
    ├─→ economyData → EconomySystem
    ├─→ bankData → BankManager
    ├─→ loanData → LoanManager
    ├─→ stockData → StockManager
    ├─→ propertyData → PropertyManager
    ├─→ bankerData → BankerSystem
    ├─→ economicState → EconomyManager
    └─→ All stored in game.settings
    ↓
[Persistent Across Sessions]
```

## Integration Points Verification

### ✅ Economy → Currency → Bank → Account
- Economy creates currencies ✓
- Bank belongs to economy ✓
- Account uses currency from economy ✓
- All linked correctly ✓

### ✅ Banker → Bank → Account
- Banker linked to bank ✓
- Banker opens bank dialog ✓
- Dialog shows accounts for player ✓
- All connected ✓

### ✅ Property → Bank → Account
- Property can link to bank ✓
- Purchase uses account ✓
- Currency conversion works ✓
- All integrated ✓

### ✅ Interest → Economy → Account
- Interest rate from economy ✓
- Calculated per account ✓
- Economic growth affects rate ✓
- All working ✓

### ✅ Exchange → Currency → Account
- Exchange rates between currencies ✓
- Used in transfers ✓
- Used in property purchases ✓
- All functional ✓

## System Dependencies

```
FoundryBank (Main)
    ├─→ EconomySystem (Independent)
    ├─→ EconomyManager (Depends on EconomySystem)
    ├─→ BankManager (Depends on EconomySystem for currency conversion)
    ├─→ LoanManager (Depends on EconomyManager)
    ├─→ StockManager (Depends on EconomyManager)
    ├─→ PropertyManager (Independent, but uses BankManager for purchases)
    └─→ BankerSystem (Depends on BankManager)
```

## Data Flow Verification

### Settings Storage
- ✅ economyData: economies, currencies, exchangeRates
- ✅ bankData: banks, accounts, transactions
- ✅ loanData: loans
- ✅ stockData: stocks, holdings
- ✅ propertyData: properties, propertyTransactions
- ✅ bankerData: bankers
- ✅ economicState: growth, interest, inflation

### Manager Initialization Order
1. ✅ EconomySystem (first - needed by others)
2. ✅ EconomyManager (needed by Loan/Stock)
3. ✅ BankManager (needed by Property/Banker)
4. ✅ LoanManager (depends on EconomyManager)
5. ✅ StockManager (depends on EconomyManager)
6. ✅ PropertyManager (independent)
7. ✅ BankerSystem (depends on BankManager)

### Hook Registration
- ✅ clickToken - Banker detection
- ✅ renderTokenHUD - Banker button
- ✅ renderActorSheet - Banker sheet button
- ✅ updateActor - Currency sync
- ✅ foundrybank.calculateInterest - Interest calculation
- ✅ foundrybank.updateStocks - Stock price updates

## Verification Checklist

### Core Systems
- ✅ EconomySystem creates/manages economies
- ✅ Currency system creates/manages currencies
- ✅ Exchange rate system works
- ✅ BankManager creates/manages banks
- ✅ Account system works
- ✅ Transaction system logs everything

### Advanced Features
- ✅ Interest calculation works
- ✅ Loan system functional
- ✅ Stock market works
- ✅ Property system integrated
- ✅ Banker system connected

### Integration
- ✅ D&D 5e currency sync (optional)
- ✅ Token interactions work
- ✅ GM Manager functional
- ✅ All dialogs render
- ✅ Data persists correctly

### User Experience
- ✅ Players can interact with bankers
- ✅ Bank dialog opens correctly
- ✅ All operations work
- ✅ Error handling in place
- ✅ Notifications show properly

## Conclusion

All systems are correctly integrated:
- ✅ Data flows properly
- ✅ Dependencies resolved
- ✅ Storage works
- ✅ User interactions functional
- ✅ GM management complete
- ✅ All features connected

System is ready for use!

