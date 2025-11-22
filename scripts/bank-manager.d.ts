/**
 * BankManager - Core banking system logic
 * @module bank-manager
 */
export interface Bank {
    id: string;
    name: string;
    economyId: string;
    description: string;
    location?: string;
    createdAt: number;
    isActive: boolean;
}
export interface BankAccount {
    id: string;
    bankId: string;
    actorId: string;
    accountName: string;
    balance: number;
    currencyId: string;
    createdAt: number;
    lastTransaction: number;
    lastInterestCalculation: number;
    interestEarned: number;
    syncWithActorCurrency: boolean;
}
export interface Transaction {
    id: string;
    accountId: string;
    actorId: string;
    type: 'deposit' | 'withdrawal' | 'transfer' | 'exchange';
    amount: number;
    currencyId: string;
    description: string;
    timestamp: number;
    fromAccountId?: string;
    toAccountId?: string;
    exchangeRate?: number;
    exchangedAmount?: number;
}
export declare class BankManager {
    private banks;
    private accounts;
    private transactions;
    private storageKey;
    private interestCalculationInterval?;
    private economySystem?;
    /**
     * Initialize the BankManager
     */
    initialize(): Promise<void>;
    /**
     * Create a new bank
     */
    createBank(name: string, economyId: string, description?: string, location?: string): Bank;
    /**
     * Get all banks
     */
    getAllBanks(): Bank[];
    /**
     * Get banks for an economy
     */
    getEconomyBanks(economyId: string): Bank[];
    /**
     * Get bank by ID
     */
    getBank(bankId: string): Bank | undefined;
    /**
     * Start automatic interest calculation
     */
    private startInterestCalculation;
    /**
     * Calculate interest for all accounts (called by EconomyManager)
     */
    calculateAllInterest(interestRate?: number): Promise<void>;
    /**
     * Create a new bank account for an actor
     */
    createAccount(bankId: string, actorId: string, accountName: string, currencyId: string, syncWithActorCurrency?: boolean): BankAccount;
    /**
     * Get all accounts for an actor
     */
    getActorAccounts(actorId: string): BankAccount[];
    /**
     * Get accounts for a bank
     */
    getBankAccounts(bankId: string): BankAccount[];
    /**
     * Get account by ID
     */
    getAccount(accountId: string): BankAccount | undefined;
    /**
     * Deposit funds into an account
     */
    deposit(accountId: string, amount: number, description?: string): Promise<Transaction>;
    /**
     * Withdraw funds from an account
     */
    withdraw(accountId: string, amount: number, description?: string): Promise<Transaction>;
    /**
     * Transfer funds between accounts
     */
    transfer(fromAccountId: string, toAccountId: string, amount: number, description?: string): Promise<Transaction>;
    /**
     * Get transaction history for an account
     */
    getAccountTransactions(accountId: string, limit?: number): Transaction[];
    /**
     * Get all transactions for an actor
     */
    getActorTransactions(actorId: string, limit?: number): Transaction[];
    /**
     * Delete an account (only if balance is zero)
     */
    deleteAccount(accountId: string): boolean;
    /**
     * Sync actor currency with bank account (D&D 5e integration)
     */
    syncActorCurrency(actor: Actor): void;
    /**
     * Map currency ID to D&D 5e currency key (only for synced accounts)
     */
    private mapCurrencyToDnd5e;
    /**
     * Deposit from actor currency to bank account (D&D 5e integration)
     */
    depositFromActorCurrency(accountId: string, amount: number): Promise<Transaction>;
    /**
     * Withdraw to actor currency from bank account (D&D 5e integration)
     */
    withdrawToActorCurrency(accountId: string, amount: number): Promise<Transaction>;
    /**
     * Calculate and apply interest to an account
     */
    calculateInterest(accountId: string, interestRate: number): Promise<number>;
    /**
     * Save data to Foundry's storage
     */
    private saveData;
    /**
     * Load data from Foundry's storage
     */
    private loadData;
}
