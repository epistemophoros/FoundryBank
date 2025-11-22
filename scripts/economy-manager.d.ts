/**
 * EconomyManager - Manages economic growth, interest rates, and market conditions
 * @module economy-manager
 */
export interface EconomicState {
    growthRate: number;
    baseInterestRate: number;
    inflationRate: number;
    lastUpdate: number;
}
export declare class EconomyManager {
    private economicState;
    private storageKey;
    constructor();
    /**
     * Initialize economy manager
     */
    initialize(): Promise<void>;
    /**
     * Get current economic state
     */
    getEconomicState(): EconomicState;
    /**
     * Get current interest rate (affected by economic growth)
     */
    getInterestRate(): number;
    /**
     * Get loan interest rate (higher than deposit rate)
     */
    getLoanInterestRate(): number;
    /**
     * Update economic growth (can be called periodically or by GM)
     */
    updateEconomicGrowth(growthRate: number): void;
    /**
     * Set base interest rate
     */
    setBaseInterestRate(rate: number): void;
    /**
     * Calculate interest for a deposit over time
     */
    calculateInterest(principal: number, days: number): number;
    /**
     * Update economic state (can simulate gradual changes)
     */
    private updateEconomicState;
    /**
     * Save economic data
     */
    private saveData;
    /**
     * Load economic data
     */
    private loadData;
}
