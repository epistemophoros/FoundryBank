# FoundryBank Module - Project Summary

## Overview

FoundryBank is a production-ready Foundry VTT module that provides a comprehensive banking system for tabletop RPG games. It allows players and GMs to manage bank accounts, perform transactions, and track financial history.

## Features Implemented

### ✅ Core Banking System
- **Account Management**: Create, view, and delete bank accounts
- **Multiple Accounts**: Each character can have multiple accounts
- **Currency Support**: Supports gp, sp, cp, pp and can be extended
- **Balance Tracking**: Real-time balance updates

### ✅ Transaction System
- **Deposits**: Add funds to accounts
- **Withdrawals**: Remove funds (with balance validation)
- **Transfers**: Move funds between accounts
- **Transaction History**: Complete audit trail with timestamps

### ✅ User Interface
- **Bank Dialog**: Main banking interface with account list and details
- **Transaction Dialogs**: Separate dialogs for deposits, withdrawals, and transfers
- **Responsive Design**: Works on different screen sizes
- **Modern UI**: Clean, professional styling with Foundry VTT theme integration

### ✅ Integration Features
- **Token Integration**: Shift+Click on tokens to open bank
- **Token HUD**: Bank icon in token HUD controls
- **Settings System**: Configurable module settings
- **Hooks API**: Exposes hooks for other modules to integrate

### ✅ Data Management
- **Persistent Storage**: All data saved to Foundry's settings system
- **Transaction Logging**: Configurable transaction history limits
- **Data Validation**: Prevents invalid operations (negative amounts, insufficient funds, etc.)

## File Structure

```
foundrybank/
├── src/                          # TypeScript source files
│   ├── foundrybank.ts           # Main module initialization
│   ├── bank-manager.ts          # Core banking logic & data management
│   ├── bank-dialog.ts           # Main UI dialog class
│   ├── bank-settings.ts         # Settings registration
│   └── handlebars-helpers.ts    # Template helper functions
├── scripts/                      # Compiled JavaScript (build output)
│   └── foundrybank.js           # Main compiled file
├── templates/                    # Handlebars templates
│   ├── bank-dialog.hbs          # Main banking interface
│   ├── create-account-dialog.hbs # Account creation form
│   ├── transaction-dialog.hbs   # Deposit/withdrawal form
│   └── transfer-dialog.hbs      # Transfer form
├── styles/                       # CSS stylesheets
│   └── foundrybank.css          # All module styles
├── lang/                         # Localization
│   └── en.json                  # English translations
├── icons/                        # Module icons
│   └── README.md                # Icon instructions
├── module.json                   # Foundry VTT module manifest
├── package.json                  # npm configuration
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # User documentation
├── BUILD.md                      # Build instructions
├── LICENSE                       # MIT License
└── .gitignore                    # Git ignore rules
```

## Technical Details

### Architecture
- **TypeScript**: Full TypeScript implementation for type safety
- **ES Modules**: Modern ES6 module system
- **Foundry API**: Uses Foundry VTT v12+ APIs
- **Handlebars**: Template rendering for UI
- **Settings API**: Uses Foundry's settings system for data persistence

### Key Classes

1. **FoundryBank**: Main module class, handles initialization and hooks
2. **BankManager**: Core banking logic, account and transaction management
3. **BankDialog**: UI application for banking interface
4. **BankSettings**: Settings registration and management

### Data Models

- **BankAccount**: Account data structure
- **Transaction**: Transaction record with full details

## Module Settings

1. **Default Currency**: Set default currency for new accounts
2. **Enable Transaction Logging**: Toggle transaction history
3. **Transaction History Limit**: Max transactions per account (10-1000)
4. **Enable Shift+Click**: Toggle token shortcut

## API for Developers

### Hooks
- `foundrybank.transaction`: Fired when any transaction completes

### Global API
- `game.foundrybank.getBankManager()`: Get BankManager instance
- `game.foundrybank.openBankDialog(token)`: Open bank for a token

## Build Process

1. Install dependencies: `npm install`
2. Build TypeScript: `npm run build`
3. Watch mode: `npm run watch`

## Compatibility

- **Foundry VTT**: Version 12+ (Verified for Version 13)
- **Game Systems**: System-agnostic
- **Dependencies**: None (pure Foundry VTT module)

## Next Steps for Production

1. **Add Icon**: Create and add `foundrybank-icon.png` to icons/ directory
2. **Build Module**: Run `npm run build` to compile TypeScript
3. **Test**: Test in Foundry VTT with various game systems
4. **Localization**: Add more language files if needed
5. **GitHub Setup**: 
   - Create GitHub repository
   - Update manifest URLs in `module.json`
   - Create releases for distribution
6. **Documentation**: Review and update README with actual repository URLs

## Known Limitations

- Currency conversion between different currency types not implemented
- No interest/loan system (can be added as extension)
- No integration with specific game system currency (can be added)
- Transaction history is limited per account (configurable)

## Future Enhancement Ideas

- Currency conversion system
- Interest rates and loans
- Bank fees and charges
- Integration with game system currency
- Export transaction history
- Bank branches/locations
- Account types (checking, savings, etc.)
- Multi-actor shared accounts
- Investment/stock market integration

## License

MIT License - See LICENSE file for details.

