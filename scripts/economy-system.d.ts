/**
 * EconomySystem - Modular framework for creating economies, currencies, and banks
 * @module economy-system
 */
export interface Economy {
    id: string;
    name: string;
    description: string;
    type: 'kingdom' | 'faction' | 'region' | 'city' | 'custom';
    growthRate: number;
    baseInterestRate: number;
    createdAt: number;
    isActive: boolean;
}
export interface Currency {
    id: string;
    economyId: string;
    symbol: string;
    name: string;
    pluralName: string;
    exchangeRate: number;
    isBaseCurrency: boolean;
    createdAt: number;
}
export interface ExchangeRate {
    fromCurrencyId: string;
    toCurrencyId: string;
    rate: number;
    lastUpdated: number;
}
export declare class EconomySystem {
    private economies;
    private currencies;
    private exchangeRates;
    private storageKey;
    /**
     * Ensure that the backing world setting exists before accessing it.
     */
    private ensureEconomySetting;
    /**
     * Initialize the economy system
     */
    initialize(): Promise<void>;
    /**
     * Create a new economy
     */
    createEconomy(name: string, description: string, type?: Economy['type'], growthRate?: number, baseInterestRate?: number): Economy;
    /**
     * Get all economies
     */
    getAllEconomies(): Economy[];
    /**
     * Get active economies
     */
    getActiveEconomies(): Economy[];
    /**
     * Get economy by ID
     */
    getEconomy(economyId: string): Economy | undefined;
    /**
     * Update economy
     */
    updateEconomy(economyId: string, updates: Partial<Economy>): void;
    /**
     * Create a new currency for an economy
     */
    createCurrency(economyId: string, symbol: string, name: string, pluralName: string, exchangeRate?: number, isBaseCurrency?: boolean): Currency;
    /**
     * Get all currencies for an economy
     */
    getEconomyCurrencies(economyId: string): Currency[];
    /**
     * Get currency by ID
     */
    getCurrency(currencyId: string): Currency | undefined;
    /**
     * Get base currency for an economy
     */
    getBaseCurrency(economyId: string): Currency | undefined;
    /**
     * Set exchange rate between two currencies
     */
    setExchangeRate(fromCurrencyId: string, toCurrencyId: string, rate: number): ExchangeRate;
    /**
     * Get exchange rate between two currencies
     */
    getExchangeRate(fromCurrencyId: string, toCurrencyId: string): number;
    /**
     * Convert currency amount
     */
    convertCurrency(amount: number, fromCurrencyId: string, toCurrencyId: string): number;
    /**
     * Create default D&D 5e economy (separate, doesn't interfere)
     */
    private createDefaultDnd5eEconomy;
    /**
     * Delete economy (only if no active banks/accounts)
     */
    deleteEconomy(economyId: string): boolean;
    /**
     * Delete currency (only if not in use)
     */
    deleteCurrency(currencyId: string): boolean;
    /**
     * Save data
     */
    private saveData;
    /**
     * Load data
     */
    private loadData;
}
