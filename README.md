# FoundryBank

A comprehensive banking system module for Foundry Virtual Tabletop. Manage character bank accounts, deposits, withdrawals, transfers, and complete transaction history with full integration into your game world.

## Features

- **Bank Account Management**: Create and manage multiple bank accounts per character
- **Deposits & Withdrawals**: Easy deposit and withdrawal operations
- **Account Transfers**: Transfer funds between accounts
- **Transaction History**: Complete audit trail of all banking transactions
- **Token Integration**: Open bank dialog by Shift+Clicking on tokens or using the token HUD
- **Multiple Currencies**: Support for gp, sp, cp, pp and custom currencies
- **System Agnostic**: Works with any game system in Foundry VTT
- **GM Controls**: Full control over banking operations for Game Masters

## Installation

### Method 1: Manifest URL (Recommended)

1. Open Foundry VTT and navigate to the **Add-on Modules** tab
2. Click **Install Module**
3. Paste the following Manifest URL:
   ```
   https://raw.githubusercontent.com/epistemophoros/FoundryBank/main/module.json
   ```
4. Click **Install** and wait for the installation to complete
5. Enable the module in your world's **Manage Modules** settings

### Method 2: Manual Installation

1. Download the latest release from the [Releases page](https://github.com/epistemophoros/FoundryBank/releases)
2. Extract the ZIP file to your Foundry VTT `Data/modules/` directory
3. Restart Foundry VTT or refresh your browser
4. Enable the module in your world's **Manage Modules** settings

## Usage

### Opening the Bank Dialog

There are three ways to open the bank dialog:

1. **Shift + Click**: Hold Shift and left-click on any token (if enabled in settings)
2. **Token HUD**: Click the bank icon (🏦) in the token HUD controls
3. **Manual**: Use the module API (for developers)

### Creating an Account

1. Open the bank dialog for a character
2. Click **Create Account**
3. Enter an account name (e.g., "Main Account", "Savings")
4. Select a currency type (gp, sp, cp, pp)
5. Click **Create**

### Making Transactions

#### Deposit
1. Select an account from the accounts list
2. Click **Deposit**
3. Enter the amount to deposit
4. (Optional) Add a description
5. Click **Confirm**

#### Withdrawal
1. Select an account from the accounts list
2. Click **Withdraw**
3. Enter the amount to withdraw
4. (Optional) Add a description
5. Click **Confirm**

**Note**: Withdrawals will fail if the account has insufficient funds.

#### Transfer
1. Select the source account
2. Click **Transfer**
3. Select the target account
4. Enter the transfer amount
5. (Optional) Add a description
6. Click **Confirm**

### Viewing Transaction History

1. Select an account from the accounts list
2. Scroll down to view the **Transaction History** section
3. All transactions are displayed with:
   - Transaction type (deposit/withdrawal/transfer)
   - Amount and currency
   - Description
   - Timestamp

## Module Settings

Access module settings via **Settings** → **Configure Settings** → **Module Settings** → **FoundryBank**

### Available Settings

- **Default Currency**: Set the default currency for new accounts (gp, sp, cp, pp)
- **Enable Transaction Logging**: Toggle automatic transaction logging
- **Transaction History Limit**: Maximum number of transactions to keep per account (10-1000)
- **Enable Shift+Click to Open Bank**: Toggle the Shift+Click shortcut

## API for Developers

FoundryBank exposes hooks and methods for other modules to interact with:

### Hooks

```javascript
// Fired when a transaction is completed
Hooks.on('foundrybank.transaction', (transaction, account) => {
  console.log('Transaction:', transaction);
  console.log('Account:', account);
});
```

### Accessing BankManager

```javascript
// Get the BankManager instance
const bankManager = game.modules.get('foundrybank').api?.getBankManager();

// Create an account
const account = bankManager.createAccount(actorId, 'My Account', 'gp');

// Make a deposit
await bankManager.deposit(account.id, 100, 'Initial deposit');

// Get account transactions
const transactions = bankManager.getAccountTransactions(account.id);
```

## Building from Source

If you want to build the module from source:

1. Clone the repository:
   ```bash
   git clone https://github.com/epistemophoros/FoundryBank.git
   cd foundrybank
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build TypeScript:
   ```bash
   npm run build
   ```

4. The compiled JavaScript will be in the `scripts/` directory

## Compatibility

- **Foundry VTT**: Version 12+ (Verified for Version 13)
- **Game Systems**: System-agnostic (works with all systems)
- **Dependencies**: None

## License

This module is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/epistemophoros/FoundryBank/issues)
- **Discussions**: Join discussions on [GitHub Discussions](https://github.com/epistemophoros/FoundryBank/discussions)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### Version 1.0.0
- Initial release
- Bank account management
- Deposit, withdrawal, and transfer functionality
- Transaction history
- Token integration (Shift+Click and HUD)
- Multiple currency support
- Module settings

## Credits

Created with ❤️ for the Foundry VTT community.

