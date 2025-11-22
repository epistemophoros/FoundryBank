/**
 * BankSettings - Module settings configuration
 * @module bank-settings
 */
export declare class BankSettings {
    /**
     * Register all module settings
     */
    static register(): void;
    /**
     * Get default currency
     */
    static getDefaultCurrency(): string;
    /**
     * Check if logging is enabled
     */
    static isLoggingEnabled(): boolean;
    /**
     * Get transaction history limit
     */
    static getTransactionHistoryLimit(): number;
    /**
     * Check if shift-click is enabled
     */
    static isShiftClickEnabled(): boolean;
}
