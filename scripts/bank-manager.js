/**
 * BankManager - Core banking system logic
 * @module bank-manager
 */
/// <reference path="./types.d.ts" />
export class BankManager {
    constructor() {
        this.banks = new Map();
        this.accounts = new Map();
        this.transactions = new Map();
        this.storageKey = 'foundrybank';
    }
    /**
     * Initialize the BankManager
     */
    async initialize() {
        await this.loadData();
        console.log(`FoundryBank | Loaded ${this.banks.size} banks, ${this.accounts.size} accounts and ${this.transactions.size} transactions`);
        // Set up daily interest calculation (runs every 24 hours)
        this.startInterestCalculation();
    }
    /**
     * Create a new bank
     */
    createBank(name, economyId, description = '', location = '') {
        const bankId = `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const bank = {
            id: bankId,
            name,
            economyId,
            description,
            location,
            createdAt: Date.now(),
            isActive: true
        };
        this.banks.set(bankId, bank);
        this.saveData();
        Hooks.call('foundrybank.bankCreated', bank);
        return bank;
    }
    /**
     * Get all banks
     */
    getAllBanks() {
        return Array.from(this.banks.values());
    }
    /**
     * Get banks for an economy
     */
    getEconomyBanks(economyId) {
        return Array.from(this.banks.values()).filter(b => b.economyId === economyId && b.isActive);
    }
    /**
     * Get bank by ID
     */
    getBank(bankId) {
        return this.banks.get(bankId);
    }
    /**
     * Start automatic interest calculation
     */
    startInterestCalculation() {
        // Calculate interest daily (in real-world time, not game time)
        // This runs every hour to check if a day has passed
        this.interestCalculationInterval = window.setInterval(() => {
            this.calculateAllInterest();
        }, 60 * 60 * 1000); // Check every hour
    }
    /**
     * Calculate interest for all accounts (called by EconomyManager)
     */
    async calculateAllInterest(interestRate) {
        if (interestRate === undefined) {
            // Get from settings or use default
            interestRate = game.settings.get('foundrybank', 'interestRate') || 0.02;
        }
        for (const account of this.accounts.values()) {
            if (account.balance > 0) {
                await this.calculateInterest(account.id, interestRate);
            }
        }
    }
    /**
     * Create a new bank account for an actor
     */
    createAccount(bankId, actorId, accountName, currencyId, syncWithActorCurrency = false) {
        const bank = this.banks.get(bankId);
        if (!bank) {
            throw new Error(`Bank ${bankId} not found`);
        }
        const accountId = `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const account = {
            id: accountId,
            bankId,
            actorId,
            accountName,
            balance: 0,
            currencyId,
            createdAt: Date.now(),
            lastTransaction: Date.now(),
            lastInterestCalculation: Date.now(),
            interestEarned: 0,
            syncWithActorCurrency
        };
        this.accounts.set(accountId, account);
        this.saveData();
        Hooks.call('foundrybank.accountCreated', account);
        return account;
    }
    /**
     * Get all accounts for an actor
     */
    getActorAccounts(actorId) {
        return Array.from(this.accounts.values()).filter(account => account.actorId === actorId);
    }
    /**
     * Get accounts for a bank
     */
    getBankAccounts(bankId) {
        return Array.from(this.accounts.values()).filter(account => account.bankId === bankId);
    }
    /**
     * Get account by ID
     */
    getAccount(accountId) {
        return this.accounts.get(accountId);
    }
    /**
     * Deposit funds into an account
     */
    async deposit(accountId, amount, description = '') {
        const account = this.accounts.get(accountId);
        if (!account) {
            throw new Error(`Account ${accountId} not found`);
        }
        if (amount <= 0) {
            throw new Error('Deposit amount must be positive');
        }
        account.balance += amount;
        account.lastTransaction = Date.now();
        const transaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            accountId,
            actorId: account.actorId,
            type: 'deposit',
            amount,
            currencyId: account.currencyId,
            description: description || `Deposit of ${amount}`,
            timestamp: Date.now()
        };
        this.transactions.set(transaction.id, transaction);
        this.saveData();
        // Emit hook for other modules
        Hooks.call('foundrybank.transaction', transaction, account);
        return transaction;
    }
    /**
     * Withdraw funds from an account
     */
    async withdraw(accountId, amount, description = '') {
        const account = this.accounts.get(accountId);
        if (!account) {
            throw new Error(`Account ${accountId} not found`);
        }
        if (amount <= 0) {
            throw new Error('Withdrawal amount must be positive');
        }
        if (account.balance < amount) {
            throw new Error('Insufficient funds');
        }
        account.balance -= amount;
        account.lastTransaction = Date.now();
        const transaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            accountId,
            actorId: account.actorId,
            type: 'withdrawal',
            amount,
            currencyId: account.currencyId,
            description: description || `Withdrawal of ${amount}`,
            timestamp: Date.now()
        };
        this.transactions.set(transaction.id, transaction);
        this.saveData();
        // Emit hook for other modules
        Hooks.call('foundrybank.transaction', transaction, account);
        return transaction;
    }
    /**
     * Transfer funds between accounts
     */
    async transfer(fromAccountId, toAccountId, amount, description = '') {
        const fromAccount = this.accounts.get(fromAccountId);
        const toAccount = this.accounts.get(toAccountId);
        if (!fromAccount || !toAccount) {
            throw new Error('One or both accounts not found');
        }
        // Allow transfers between different currencies (will use exchange rate)
        // For same currency, direct transfer
        // For different currencies, convert using exchange rate
        // Note: Exchange rate conversion handled by EconomySystem
        if (amount <= 0) {
            throw new Error('Transfer amount must be positive');
        }
        if (fromAccount.balance < amount) {
            throw new Error('Insufficient funds');
        }
        // Handle currency conversion if needed
        let convertedAmount = amount;
        let exchangeRate = 1.0;
        if (fromAccount.currencyId !== toAccount.currencyId) {
            // Get exchange rate from EconomySystem if available
            if (this.economySystem) {
                exchangeRate = this.economySystem.getExchangeRate(fromAccount.currencyId, toAccount.currencyId);
                convertedAmount = amount * exchangeRate;
            }
            else {
                // Fallback: can't convert, throw error
                throw new Error('Cannot transfer between different currencies without exchange rate system');
            }
        }
        fromAccount.balance -= amount;
        toAccount.balance += convertedAmount;
        fromAccount.lastTransaction = Date.now();
        toAccount.lastTransaction = Date.now();
        const transaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            accountId: fromAccountId,
            actorId: fromAccount.actorId,
            type: 'transfer',
            amount,
            currencyId: fromAccount.currencyId,
            description: description || `Transfer to ${toAccount.accountName}`,
            timestamp: Date.now(),
            fromAccountId,
            toAccountId,
            exchangeRate: exchangeRate !== 1.0 ? exchangeRate : undefined,
            exchangedAmount: convertedAmount !== amount ? convertedAmount : undefined
        };
        this.transactions.set(transaction.id, transaction);
        this.saveData();
        // Emit hook for other modules
        Hooks.call('foundrybank.transaction', transaction, fromAccount);
        return transaction;
    }
    /**
     * Get transaction history for an account
     */
    getAccountTransactions(accountId, limit = 50) {
        return Array.from(this.transactions.values())
            .filter(txn => txn.accountId === accountId || txn.fromAccountId === accountId || txn.toAccountId === accountId)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }
    /**
     * Get all transactions for an actor
     */
    getActorTransactions(actorId, limit = 50) {
        return Array.from(this.transactions.values())
            .filter(txn => txn.actorId === actorId)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }
    /**
     * Delete an account (only if balance is zero)
     */
    deleteAccount(accountId) {
        const account = this.accounts.get(accountId);
        if (!account) {
            return false;
        }
        if (account.balance !== 0) {
            throw new Error('Cannot delete account with non-zero balance');
        }
        this.accounts.delete(accountId);
        this.saveData();
        return true;
    }
    /**
     * Sync actor currency with bank account (D&D 5e integration)
     */
    syncActorCurrency(actor) {
        // Get accounts that sync with actor currency
        const syncedAccounts = Array.from(this.accounts.values())
            .filter(acc => acc.actorId === actor.id && acc.syncWithActorCurrency);
        if (syncedAccounts.length === 0)
            return;
        // Check if this is a D&D 5e system
        const isDnd5e = game.system.id === 'dnd5e';
        if (!isDnd5e)
            return;
        // Get actor currency (D&D 5e format: system.currency)
        const currency = actor.system?.currency;
        if (!currency)
            return;
        syncedAccounts.forEach(account => {
            // Map currency types
            const currencyKey = this.mapCurrencyToDnd5e(account.currencyId);
            if (currencyKey && currency[currencyKey] !== undefined) {
                // Sync bank balance with actor currency
                const actorCurrencyAmount = currency[currencyKey].value || 0;
                // Only sync if there's a difference (to avoid loops)
                if (Math.abs(account.balance - actorCurrencyAmount) > 0.01) {
                    account.balance = actorCurrencyAmount;
                }
            }
        });
        this.saveData();
    }
    /**
     * Map currency ID to D&D 5e currency key (only for synced accounts)
     */
    mapCurrencyToDnd5e(currencyId) {
        // This would need to check if currencyId matches a D&D 5e currency
        // For now, only works if currency symbol matches D&D 5e standard
        // In practice, you'd check the EconomySystem for currency details
        return null; // Will be implemented when EconomySystem is available
    }
    /**
     * Deposit from actor currency to bank account (D&D 5e integration)
     */
    async depositFromActorCurrency(accountId, amount) {
        const account = this.accounts.get(accountId);
        if (!account || !account.syncWithActorCurrency) {
            throw new Error('Account does not sync with actor currency');
        }
        const actor = game.actors?.get(account.actorId);
        if (!actor) {
            throw new Error('Actor not found');
        }
        const isDnd5e = game.system.id === 'dnd5e';
        if (!isDnd5e) {
            throw new Error('D&D 5e system not detected');
        }
        const currency = actor.system?.currency;
        if (!currency) {
            throw new Error('Actor currency not found');
        }
        const currencyKey = this.mapCurrencyToDnd5e(account.currencyId);
        if (!currencyKey || currency[currencyKey] === undefined) {
            throw new Error(`Currency ${account.currencyId} not supported`);
        }
        const currentAmount = currency[currencyKey].value || 0;
        if (currentAmount < amount) {
            throw new Error('Insufficient funds in actor currency');
        }
        // Update actor currency
        await actor.update({
            [`system.currency.${currencyKey}.value`]: currentAmount - amount
        });
        // Deposit to bank
        return await this.deposit(accountId, amount, `Deposit from character inventory`);
    }
    /**
     * Withdraw to actor currency from bank account (D&D 5e integration)
     */
    async withdrawToActorCurrency(accountId, amount) {
        const account = this.accounts.get(accountId);
        if (!account || !account.syncWithActorCurrency) {
            throw new Error('Account does not sync with actor currency');
        }
        const actor = game.actors?.get(account.actorId);
        if (!actor) {
            throw new Error('Actor not found');
        }
        const isDnd5e = game.system.id === 'dnd5e';
        if (!isDnd5e) {
            throw new Error('D&D 5e system not detected');
        }
        const currency = actor.system?.currency;
        if (!currency) {
            throw new Error('Actor currency not found');
        }
        const currencyKey = this.mapCurrencyToDnd5e(account.currencyId);
        if (!currencyKey || currency[currencyKey] === undefined) {
            throw new Error(`Currency ${account.currencyId} not supported`);
        }
        // Withdraw from bank first
        const transaction = await this.withdraw(accountId, amount, `Withdrawal to character inventory`);
        // Update actor currency
        const currentAmount = currency[currencyKey].value || 0;
        await actor.update({
            [`system.currency.${currencyKey}.value`]: currentAmount + amount
        });
        return transaction;
    }
    /**
     * Calculate and apply interest to an account
     */
    async calculateInterest(accountId, interestRate) {
        const account = this.accounts.get(accountId);
        if (!account) {
            throw new Error(`Account ${accountId} not found`);
        }
        if (account.balance <= 0)
            return 0;
        // Calculate days since last interest calculation
        const daysSinceLastInterest = (Date.now() - account.lastInterestCalculation) / (1000 * 60 * 60 * 24);
        if (daysSinceLastInterest < 1)
            return 0; // Only calculate daily
        // Calculate interest (simple interest: principal * rate * time)
        const interest = account.balance * interestRate * (daysSinceLastInterest / 365);
        if (interest > 0) {
            account.balance += interest;
            account.interestEarned += interest;
            account.lastInterestCalculation = Date.now();
            this.saveData();
            // Create interest transaction
            const transaction = {
                id: `txn_interest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                accountId,
                actorId: account.actorId,
                type: 'deposit',
                amount: interest,
                currencyId: account.currencyId,
                description: `Interest payment (${(interestRate * 100).toFixed(2)}% annual)`,
                timestamp: Date.now()
            };
            this.transactions.set(transaction.id, transaction);
            this.saveData();
            Hooks.call('foundrybank.interestPaid', transaction, account);
        }
        return interest;
    }
    /**
     * Save data to Foundry's storage
     */
    async saveData() {
        const data = {
            banks: Array.from(this.banks.entries()),
            accounts: Array.from(this.accounts.entries()),
            transactions: Array.from(this.transactions.entries())
        };
        await game.settings.set(this.storageKey, 'bankData', data);
    }
    /**
     * Load data from Foundry's storage
     */
    async loadData() {
        const data = game.settings.get(this.storageKey, 'bankData');
        if (data?.banks) {
            this.banks = new Map(data.banks);
        }
        if (data?.accounts) {
            this.accounts = new Map(data.accounts);
        }
        if (data?.transactions) {
            this.transactions = new Map(data.transactions);
        }
    }
}
