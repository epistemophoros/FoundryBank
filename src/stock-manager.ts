/**
 * StockManager - Manages stock market with dynamic prices
 * @module stock-manager
 */

import { EconomyManager } from './economy-manager.js';

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  basePrice: number; // Initial/base price
  currentPrice: number; // Current market price
  currency: string;
  volatility: number; // 0.0 to 1.0 (how much price fluctuates)
  lastUpdate: number;
  priceHistory: Array<{ price: number; timestamp: number }>;
}

export interface StockHolding {
  id: string;
  actorId: string;
  stockId: string;
  shares: number;
  averagePrice: number; // Average purchase price
  purchasedAt: number;
}

export class StockManager {
  private stocks: Map<string, Stock> = new Map();
  private holdings: Map<string, StockHolding> = new Map();
  private economyManager: EconomyManager;
  private storageKey: string = 'foundrybank';

  constructor(economyManager: EconomyManager) {
    this.economyManager = economyManager;
  }

  /**
   * Initialize stock manager
   */
  async initialize(): Promise<void> {
    await this.loadData();
    this.updateStockPrices();
  }

  /**
   * Create a new stock
   */
  createStock(symbol: string, name: string, basePrice: number, currency: string = 'gp', volatility: number = 0.1): Stock {
    const stockId = `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const stock: Stock = {
      id: stockId,
      symbol,
      name,
      basePrice,
      currentPrice: basePrice,
      currency,
      volatility: Math.max(0, Math.min(1.0, volatility)),
      lastUpdate: Date.now(),
      priceHistory: [{ price: basePrice, timestamp: Date.now() }]
    };

    this.stocks.set(stockId, stock);
    this.saveData();

    Hooks.call('foundrybank.stockCreated', stock);
    return stock;
  }

  /**
   * Get all stocks
   */
  getAllStocks(): Stock[] {
    return Array.from(this.stocks.values());
  }

  /**
   * Get stock by ID
   */
  getStock(stockId: string): Stock | undefined {
    return this.stocks.get(stockId);
  }

  /**
   * Get stock by symbol
   */
  getStockBySymbol(symbol: string): Stock | undefined {
    return Array.from(this.stocks.values()).find(s => s.symbol === symbol);
  }

  /**
   * Buy stock shares
   */
  buyStock(actorId: string, stockId: string, shares: number): StockHolding {
    const stock = this.stocks.get(stockId);
    if (!stock) {
      throw new Error(`Stock ${stockId} not found`);
    }

    if (shares <= 0) {
      throw new Error('Must buy at least 1 share');
    }

    // Check if actor already owns this stock
    const existingHolding = Array.from(this.holdings.values())
      .find(h => h.actorId === actorId && h.stockId === stockId);

    let holding: StockHolding;

    if (existingHolding) {
      // Update existing holding
      const totalCost = (existingHolding.averagePrice * existingHolding.shares) + (stock.currentPrice * shares);
      existingHolding.shares += shares;
      existingHolding.averagePrice = totalCost / existingHolding.shares;
      holding = existingHolding;
    } else {
      // Create new holding
      const holdingId = `holding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      holding = {
        id: holdingId,
        actorId,
        stockId,
        shares,
        averagePrice: stock.currentPrice,
        purchasedAt: Date.now()
      };
      this.holdings.set(holdingId, holding);
    }

    this.saveData();
    Hooks.call('foundrybank.stockPurchased', holding, stock, shares);

    return holding;
  }

  /**
   * Sell stock shares
   */
  sellStock(holdingId: string, shares: number): { proceeds: number; profit: number } {
    const holding = this.holdings.get(holdingId);
    if (!holding) {
      throw new Error(`Holding ${holdingId} not found`);
    }

    if (shares > holding.shares) {
      throw new Error('Cannot sell more shares than owned');
    }

    const stock = this.stocks.get(holding.stockId);
    if (!stock) {
      throw new Error('Stock not found');
    }

    const proceeds = stock.currentPrice * shares;
    const cost = holding.averagePrice * shares;
    const profit = proceeds - cost;

    holding.shares -= shares;

    // Remove holding if all shares sold
    if (holding.shares <= 0) {
      this.holdings.delete(holdingId);
    }

    this.saveData();
    Hooks.call('foundrybank.stockSold', holding, stock, shares, profit);

    return { proceeds, profit };
  }

  /**
   * Get actor's stock holdings
   */
  getActorHoldings(actorId: string): StockHolding[] {
    return Array.from(this.holdings.values()).filter(h => h.actorId === actorId);
  }

  /**
   * Get holding by ID
   */
  getHolding(holdingId: string): StockHolding | undefined {
    return this.holdings.get(holdingId);
  }

  /**
   * Update stock prices based on economic conditions
   */
  updateStockPrices(): void {
    const economicState = this.economyManager.getEconomicState();
    
    this.stocks.forEach(stock => {
      // Price changes based on:
      // 1. Economic growth (positive growth = price increase)
      // 2. Random volatility
      // 3. Time since last update
      
      const daysSinceUpdate = (Date.now() - stock.lastUpdate) / (1000 * 60 * 60 * 24);
      const growthFactor = 1 + (economicState.growthRate * 0.1); // 10% max change per 100% growth
      const volatilityFactor = 1 + ((Math.random() - 0.5) * 2 * stock.volatility); // Random volatility
      
      const priceChange = stock.currentPrice * (growthFactor - 1) * (daysSinceUpdate / 30); // Monthly adjustment
      const volatilityChange = stock.currentPrice * (volatilityFactor - 1) * 0.1; // 10% of volatility per update
      
      stock.currentPrice = Math.max(0.01, stock.currentPrice + priceChange + volatilityChange);
      stock.lastUpdate = Date.now();
      
      // Add to price history (keep last 100 entries)
      stock.priceHistory.push({ price: stock.currentPrice, timestamp: Date.now() });
      if (stock.priceHistory.length > 100) {
        stock.priceHistory.shift();
      }
    });

    this.saveData();
    Hooks.call('foundrybank.stockPricesUpdated', Array.from(this.stocks.values()));
  }

  /**
   * Save stock data
   */
  private async saveData(): Promise<void> {
    const data = {
      stocks: Array.from(this.stocks.entries()),
      holdings: Array.from(this.holdings.entries())
    };
    await game.settings.set(this.storageKey, 'stockData', data);
  }

  /**
   * Load stock data
   */
  private async loadData(): Promise<void> {
    const data = game.settings.get(this.storageKey, 'stockData') as any;
    if (data?.stocks) {
      this.stocks = new Map(data.stocks);
    }
    if (data?.holdings) {
      this.holdings = new Map(data.holdings);
    }
  }
}

