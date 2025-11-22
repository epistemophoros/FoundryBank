/**
 * StockManager - Manages stock market with dynamic prices
 * @module stock-manager
 */
import { EconomyManager } from './economy-manager.js';
export interface Stock {
    id: string;
    symbol: string;
    name: string;
    basePrice: number;
    currentPrice: number;
    currency: string;
    volatility: number;
    lastUpdate: number;
    priceHistory: Array<{
        price: number;
        timestamp: number;
    }>;
}
export interface StockHolding {
    id: string;
    actorId: string;
    stockId: string;
    shares: number;
    averagePrice: number;
    purchasedAt: number;
}
export declare class StockManager {
    private stocks;
    private holdings;
    private economyManager;
    private storageKey;
    constructor(economyManager: EconomyManager);
    /**
     * Initialize stock manager
     */
    initialize(): Promise<void>;
    /**
     * Create a new stock
     */
    createStock(symbol: string, name: string, basePrice: number, currency?: string, volatility?: number): Stock;
    /**
     * Get all stocks
     */
    getAllStocks(): Stock[];
    /**
     * Get stock by ID
     */
    getStock(stockId: string): Stock | undefined;
    /**
     * Get stock by symbol
     */
    getStockBySymbol(symbol: string): Stock | undefined;
    /**
     * Buy stock shares
     */
    buyStock(actorId: string, stockId: string, shares: number): StockHolding;
    /**
     * Sell stock shares
     */
    sellStock(holdingId: string, shares: number): {
        proceeds: number;
        profit: number;
    };
    /**
     * Get actor's stock holdings
     */
    getActorHoldings(actorId: string): StockHolding[];
    /**
     * Get holding by ID
     */
    getHolding(holdingId: string): StockHolding | undefined;
    /**
     * Update stock prices based on economic conditions
     */
    updateStockPrices(): void;
    /**
     * Save stock data
     */
    private saveData;
    /**
     * Load stock data
     */
    private loadData;
}
