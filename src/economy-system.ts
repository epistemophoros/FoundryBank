/**
 * EconomySystem - Modular framework for creating economies, currencies, and banks
 * @module economy-system
 */

export interface Economy {
  id: string;
  name: string;
  description: string;
  type: 'kingdom' | 'faction' | 'region' | 'city' | 'custom';
  growthRate: number; // -1.0 to 1.0
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
  exchangeRate: number; // Exchange rate to base currency (gp)
  isBaseCurrency: boolean; // Is this the base currency for the economy?
  createdAt: number;
}

export interface ExchangeRate {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number; // 1 fromCurrency = rate toCurrency
  lastUpdated: number;
}

export class EconomySystem {
  private economies: Map<string, Economy> = new Map();
  private currencies: Map<string, Currency> = new Map();
  private exchangeRates: Map<string, ExchangeRate> = new Map(); // Key: "fromId-toId"
  private storageKey: string = 'foundrybank';

  /**
   * Initialize the economy system
   */
  async initialize(): Promise<void> {
    await this.loadData();
    
    // Create default D&D 5e economy if none exists
    if (this.economies.size === 0) {
      this.createDefaultDnd5eEconomy();
    }
  }

  /**
   * Create a new economy
   */
  createEconomy(
    name: string,
    description: string,
    type: Economy['type'] = 'custom',
    growthRate: number = 0.0,
    baseInterestRate: number = 0.02
  ): Economy {
    const economyId = `economy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const economy: Economy = {
      id: economyId,
      name,
      description,
      type,
      growthRate: Math.max(-1.0, Math.min(1.0, growthRate)),
      baseInterestRate: Math.max(0, Math.min(1.0, baseInterestRate)),
      createdAt: Date.now(),
      isActive: true
    };

    this.economies.set(economyId, economy);
    this.saveData();

    Hooks.call('foundrybank.economyCreated', economy);
    return economy;
  }

  /**
   * Get all economies
   */
  getAllEconomies(): Economy[] {
    return Array.from(this.economies.values());
  }

  /**
   * Get active economies
   */
  getActiveEconomies(): Economy[] {
    return this.getAllEconomies().filter(e => e.isActive);
  }

  /**
   * Get economy by ID
   */
  getEconomy(economyId: string): Economy | undefined {
    return this.economies.get(economyId);
  }

  /**
   * Update economy
   */
  updateEconomy(economyId: string, updates: Partial<Economy>): void {
    const economy = this.economies.get(economyId);
    if (!economy) {
      throw new Error(`Economy ${economyId} not found`);
    }

    Object.assign(economy, updates);
    this.saveData();
    Hooks.call('foundrybank.economyUpdated', economy);
  }

  /**
   * Create a new currency for an economy
   */
  createCurrency(
    economyId: string,
    symbol: string,
    name: string,
    pluralName: string,
    exchangeRate: number = 1.0,
    isBaseCurrency: boolean = false
  ): Currency {
    const economy = this.economies.get(economyId);
    if (!economy) {
      throw new Error(`Economy ${economyId} not found`);
    }

    // If this is the base currency, ensure only one base currency per economy
    if (isBaseCurrency) {
      const existingBase = Array.from(this.currencies.values())
        .find(c => c.economyId === economyId && c.isBaseCurrency);
      if (existingBase) {
        existingBase.isBaseCurrency = false;
      }
    }

    const currencyId = `currency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const currency: Currency = {
      id: currencyId,
      economyId,
      symbol,
      name,
      pluralName,
      exchangeRate,
      isBaseCurrency,
      createdAt: Date.now()
    };

    this.currencies.set(currencyId, currency);
    this.saveData();

    Hooks.call('foundrybank.currencyCreated', currency);
    return currency;
  }

  /**
   * Get all currencies for an economy
   */
  getEconomyCurrencies(economyId: string): Currency[] {
    return Array.from(this.currencies.values()).filter(c => c.economyId === economyId);
  }

  /**
   * Get currency by ID
   */
  getCurrency(currencyId: string): Currency | undefined {
    return this.currencies.get(currencyId);
  }

  /**
   * Get base currency for an economy
   */
  getBaseCurrency(economyId: string): Currency | undefined {
    return Array.from(this.currencies.values())
      .find(c => c.economyId === economyId && c.isBaseCurrency);
  }

  /**
   * Set exchange rate between two currencies
   */
  setExchangeRate(fromCurrencyId: string, toCurrencyId: string, rate: number): ExchangeRate {
    if (rate <= 0) {
      throw new Error('Exchange rate must be positive');
    }

    const key = `${fromCurrencyId}-${toCurrencyId}`;
    const reverseKey = `${toCurrencyId}-${fromCurrencyId}`;

    const exchangeRate: ExchangeRate = {
      fromCurrencyId,
      toCurrencyId,
      rate,
      lastUpdated: Date.now()
    };

    this.exchangeRates.set(key, exchangeRate);

    // Set reverse rate automatically
    const reverseRate: ExchangeRate = {
      fromCurrencyId: toCurrencyId,
      toCurrencyId: fromCurrencyId,
      rate: 1 / rate,
      lastUpdated: Date.now()
    };
    this.exchangeRates.set(reverseKey, reverseRate);

    this.saveData();
    Hooks.call('foundrybank.exchangeRateUpdated', exchangeRate);

    return exchangeRate;
  }

  /**
   * Get exchange rate between two currencies
   */
  getExchangeRate(fromCurrencyId: string, toCurrencyId: string): number {
    if (fromCurrencyId === toCurrencyId) return 1.0;

    const key = `${fromCurrencyId}-${toCurrencyId}`;
    const exchangeRate = this.exchangeRates.get(key);
    
    if (exchangeRate) {
      return exchangeRate.rate;
    }

    // Try to calculate via base currencies
    const fromCurrency = this.getCurrency(fromCurrencyId);
    const toCurrency = this.getCurrency(toCurrencyId);
    
    if (fromCurrency && toCurrency) {
      // If same economy, use exchange rates
      if (fromCurrency.economyId === toCurrency.economyId) {
        return toCurrency.exchangeRate / fromCurrency.exchangeRate;
      }
      
      // Convert via base currencies (to gp)
      const fromToGp = fromCurrency.exchangeRate;
      const gpToTo = 1 / toCurrency.exchangeRate;
      return fromToGp * gpToTo;
    }

    return 1.0; // Default 1:1 if can't determine
  }

  /**
   * Convert currency amount
   */
  convertCurrency(amount: number, fromCurrencyId: string, toCurrencyId: string): number {
    const rate = this.getExchangeRate(fromCurrencyId, toCurrencyId);
    return amount * rate;
  }

  /**
   * Create default D&D 5e economy (separate, doesn't interfere)
   */
  private createDefaultDnd5eEconomy(): void {
    const dnd5eEconomy = this.createEconomy(
      'D&D 5e Standard',
      'Standard D&D 5e currency system',
      'custom',
      0.0,
      0.0
    );

    // Create standard D&D 5e currencies (these are just for reference, not used by bank)
    this.createCurrency(dnd5eEconomy.id, 'pp', 'Platinum Piece', 'Platinum Pieces', 10.0, true);
    this.createCurrency(dnd5eEconomy.id, 'gp', 'Gold Piece', 'Gold Pieces', 1.0);
    this.createCurrency(dnd5eEconomy.id, 'ep', 'Electrum Piece', 'Electrum Pieces', 0.5);
    this.createCurrency(dnd5eEconomy.id, 'sp', 'Silver Piece', 'Silver Pieces', 0.1);
    this.createCurrency(dnd5eEconomy.id, 'cp', 'Copper Piece', 'Copper Pieces', 0.01);
  }

  /**
   * Delete economy (only if no active banks/accounts)
   */
  deleteEconomy(economyId: string): boolean {
    const economy = this.economies.get(economyId);
    if (!economy) return false;

    // Check if currencies are in use (would need to check with BankManager)
    // For now, just mark as inactive
    economy.isActive = false;
    this.saveData();
    
    Hooks.call('foundrybank.economyDeleted', economy);
    return true;
  }

  /**
   * Delete currency (only if not in use)
   */
  deleteCurrency(currencyId: string): boolean {
    const currency = this.currencies.get(currencyId);
    if (!currency) return false;

    // Check if currency is in use (would need to check with BankManager)
    this.currencies.delete(currencyId);
    this.saveData();
    
    Hooks.call('foundrybank.currencyDeleted', currency);
    return true;
  }

  /**
   * Save data
   */
  private async saveData(): Promise<void> {
    const data = {
      economies: Array.from(this.economies.entries()),
      currencies: Array.from(this.currencies.entries()),
      exchangeRates: Array.from(this.exchangeRates.entries())
    };
    await game.settings.set(this.storageKey, 'economyData', data);
  }

  /**
   * Load data
   */
  private async loadData(): Promise<void> {
    const data = game.settings.get(this.storageKey, 'economyData') as any;
    
    if (data?.economies) {
      this.economies = new Map(data.economies);
    }
    if (data?.currencies) {
      this.currencies = new Map(data.currencies);
    }
    if (data?.exchangeRates) {
      this.exchangeRates = new Map(data.exchangeRates);
    }
  }
}

