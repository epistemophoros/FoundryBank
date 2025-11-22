/**
 * PropertyManager - Manages properties, assets, and real estate
 * @module property-manager
 */

export interface Property {
  id: string;
  name: string;
  description: string;
  type: 'real_estate' | 'business' | 'land' | 'ship' | 'vehicle' | 'equipment' | 'custom';
  economyId: string; // Property belongs to an economy
  bankId?: string; // Optional: property sold through a bank
  currencyId: string; // Purchase price currency
  purchasePrice: number; // Original purchase price
  currentValue: number; // Current market value
  ownerId?: string; // Actor ID of owner (null if unowned)
  location?: string; // Physical location
  purchasedAt?: number; // Purchase timestamp
  purchasedBy?: string; // Actor ID who purchased
  income?: number; // Optional: income generated (rent, business profit, etc.)
  expenses?: number; // Optional: maintenance costs
  status: 'available' | 'owned' | 'rented' | 'maintenance' | 'sold';
  metadata?: Record<string, any>; // Additional custom data
  createdAt: number;
}

export interface PropertyTransaction {
  id: string;
  propertyId: string;
  type: 'purchase' | 'sale' | 'rent' | 'maintenance' | 'income';
  actorId: string;
  amount: number;
  currencyId: string;
  description: string;
  timestamp: number;
  fromAccountId?: string; // Account used for purchase
  toAccountId?: string; // Account receiving sale proceeds
}

export class PropertyManager {
  private properties: Map<string, Property> = new Map();
  private transactions: Map<string, PropertyTransaction> = new Map();
  private storageKey: string = 'foundrybank';

  /**
   * Initialize the PropertyManager
   */
  async initialize(): Promise<void> {
    await this.loadData();
    console.log(`FoundryBank | Loaded ${this.properties.size} properties`);
  }

  /**
   * Create a new property
   */
  createProperty(
    name: string,
    description: string,
    type: Property['type'],
    economyId: string,
    purchasePrice: number,
    currencyId: string,
    bankId?: string,
    location?: string,
    income?: number,
    expenses?: number
  ): Property {
    const propertyId = `property_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const property: Property = {
      id: propertyId,
      name,
      description,
      type,
      economyId,
      bankId,
      currencyId,
      purchasePrice,
      currentValue: purchasePrice, // Start at purchase price
      location,
      income,
      expenses,
      status: 'available',
      createdAt: Date.now()
    };

    this.properties.set(propertyId, property);
    this.saveData();

    Hooks.call('foundrybank.propertyCreated', property);
    return property;
  }

  /**
   * Get all properties
   */
  getAllProperties(): Property[] {
    return Array.from(this.properties.values());
  }

  /**
   * Get properties by economy
   */
  getEconomyProperties(economyId: string): Property[] {
    return Array.from(this.properties.values()).filter(p => p.economyId === economyId);
  }

  /**
   * Get properties by bank
   */
  getBankProperties(bankId: string): Property[] {
    return Array.from(this.properties.values()).filter(p => p.bankId === bankId);
  }

  /**
   * Get available properties (not owned)
   */
  getAvailableProperties(economyId?: string): Property[] {
    const all = economyId 
      ? this.getEconomyProperties(economyId)
      : this.getAllProperties();
    return all.filter(p => p.status === 'available');
  }

  /**
   * Get properties owned by an actor
   */
  getActorProperties(actorId: string): Property[] {
    return Array.from(this.properties.values()).filter(p => p.ownerId === actorId);
  }

  /**
   * Get property by ID
   */
  getProperty(propertyId: string): Property | undefined {
    return this.properties.get(propertyId);
  }

  /**
   * Purchase a property (withdraws from bank account automatically)
   */
  async purchaseProperty(
    propertyId: string,
    actorId: string,
    accountId: string,
    purchasePrice?: number,
    bankManager?: any // BankManager instance for account withdrawal
  ): Promise<PropertyTransaction> {
    const property = this.properties.get(propertyId);
    if (!property) {
      throw new Error(`Property ${propertyId} not found`);
    }

    if (property.status !== 'available') {
      throw new Error('Property is not available for purchase');
    }

    const price = purchasePrice ?? property.purchasePrice;

    // Withdraw from bank account if bankManager is provided
    if (bankManager) {
      const account = bankManager.getAccount(accountId);
      if (!account) {
        throw new Error(`Account ${accountId} not found`);
      }

      // Check if account has sufficient funds
      if (account.balance < price) {
        throw new Error(`Insufficient funds. Need ${price}, have ${account.balance}`);
      }

      // Check currency match
      if (account.currencyId !== property.currencyId) {
        // Try to convert currency
        const economySystem = (game.foundrybank as any)?.getEconomySystem?.();
        if (economySystem) {
          const exchangeRate = economySystem.getExchangeRate(account.currencyId, property.currencyId);
          const convertedPrice = price / exchangeRate;
          
          if (account.balance < convertedPrice) {
            throw new Error(`Insufficient funds after currency conversion. Need ${convertedPrice} ${account.currencyId}, have ${account.balance}`);
          }

          // Withdraw converted amount
          await bankManager.withdraw(accountId, convertedPrice, `Property purchase: ${property.name}`);
        } else {
          throw new Error('Currency mismatch and no exchange rate system available');
        }
      } else {
        // Same currency, direct withdrawal
        await bankManager.withdraw(accountId, price, `Property purchase: ${property.name}`);
      }
    }

    // Create transaction record
    const transaction: PropertyTransaction = {
      id: `ptxn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      propertyId,
      type: 'purchase',
      actorId,
      amount: price,
      currencyId: property.currencyId,
      description: `Purchase of ${property.name}`,
      timestamp: Date.now(),
      fromAccountId: accountId
    };

    // Update property
    property.ownerId = actorId;
    property.purchasedBy = actorId;
    property.purchasedAt = Date.now();
    property.status = 'owned';
    property.currentValue = price;

    this.transactions.set(transaction.id, transaction);
    this.saveData();

    Hooks.call('foundrybank.propertyPurchased', property, transaction);
    return transaction;
  }

  /**
   * Sell a property (deposits to bank account automatically)
   */
  async sellProperty(
    propertyId: string,
    actorId: string,
    salePrice: number,
    toAccountId?: string,
    bankManager?: any // BankManager instance for account deposit
  ): Promise<PropertyTransaction> {
    const property = this.properties.get(propertyId);
    if (!property) {
      throw new Error(`Property ${propertyId} not found`);
    }

    if (property.ownerId !== actorId) {
      throw new Error('You do not own this property');
    }

    if (property.status !== 'owned') {
      throw new Error('Property cannot be sold in its current status');
    }

    // Deposit to bank account if bankManager and account provided
    if (bankManager && toAccountId) {
      const account = bankManager.getAccount(toAccountId);
      if (!account) {
        throw new Error(`Account ${toAccountId} not found`);
      }

      // Check currency match
      if (account.currencyId !== property.currencyId) {
        // Try to convert currency
        const economySystem = (game.foundrybank as any)?.getEconomySystem?.();
        if (economySystem) {
          const exchangeRate = economySystem.getExchangeRate(property.currencyId, account.currencyId);
          const convertedAmount = salePrice * exchangeRate;
          
          // Deposit converted amount
          await bankManager.deposit(toAccountId, convertedAmount, `Property sale: ${property.name}`);
        } else {
          throw new Error('Currency mismatch and no exchange rate system available');
        }
      } else {
        // Same currency, direct deposit
        await bankManager.deposit(toAccountId, salePrice, `Property sale: ${property.name}`);
      }
    }

    // Create transaction record
    const transaction: PropertyTransaction = {
      id: `ptxn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      propertyId,
      type: 'sale',
      actorId,
      amount: salePrice,
      currencyId: property.currencyId,
      description: `Sale of ${property.name}`,
      timestamp: Date.now(),
      toAccountId
    };

    // Update property
    property.ownerId = undefined;
    property.purchasedBy = undefined;
    property.purchasedAt = undefined;
    property.status = 'available';
    property.currentValue = salePrice;

    this.transactions.set(transaction.id, transaction);
    this.saveData();

    Hooks.call('foundrybank.propertySold', property, transaction);
    return transaction;
  }

  /**
   * Update property value
   */
  updatePropertyValue(propertyId: string, newValue: number): void {
    const property = this.properties.get(propertyId);
    if (!property) {
      throw new Error(`Property ${propertyId} not found`);
    }

    property.currentValue = newValue;
    this.saveData();

    Hooks.call('foundrybank.propertyValueUpdated', property);
  }

  /**
   * Set property income/expenses
   */
  updatePropertyFinancials(propertyId: string, income?: number, expenses?: number): void {
    const property = this.properties.get(propertyId);
    if (!property) {
      throw new Error(`Property ${propertyId} not found`);
    }

    if (income !== undefined) property.income = income;
    if (expenses !== undefined) property.expenses = expenses;
    this.saveData();

    Hooks.call('foundrybank.propertyFinancialsUpdated', property);
  }

  /**
   * Record property income
   */
  recordIncome(propertyId: string, amount: number, description: string = ''): PropertyTransaction {
    const property = this.properties.get(propertyId);
    if (!property) {
      throw new Error(`Property ${propertyId} not found`);
    }

    const transaction: PropertyTransaction = {
      id: `ptxn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      propertyId,
      type: 'income',
      actorId: property.ownerId || '',
      amount,
      currencyId: property.currencyId,
      description: description || `Income from ${property.name}`,
      timestamp: Date.now()
    };

    this.transactions.set(transaction.id, transaction);
    this.saveData();

    Hooks.call('foundrybank.propertyIncome', property, transaction);
    return transaction;
  }

  /**
   * Record property expenses
   */
  recordExpense(propertyId: string, amount: number, description: string = ''): PropertyTransaction {
    const property = this.properties.get(propertyId);
    if (!property) {
      throw new Error(`Property ${propertyId} not found`);
    }

    const transaction: PropertyTransaction = {
      id: `ptxn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      propertyId,
      type: 'maintenance',
      actorId: property.ownerId || '',
      amount,
      currencyId: property.currencyId,
      description: description || `Maintenance for ${property.name}`,
      timestamp: Date.now()
    };

    this.transactions.set(transaction.id, transaction);
    this.saveData();

    Hooks.call('foundrybank.propertyExpense', property, transaction);
    return transaction;
  }

  /**
   * Get property transactions
   */
  getPropertyTransactions(propertyId: string): PropertyTransaction[] {
    return Array.from(this.transactions.values())
      .filter(txn => txn.propertyId === propertyId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get actor property transactions
   */
  getActorPropertyTransactions(actorId: string): PropertyTransaction[] {
    return Array.from(this.transactions.values())
      .filter(txn => txn.actorId === actorId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Calculate property net worth for an actor
   */
  calculateActorPropertyValue(actorId: string, currencyId?: string): number {
    const properties = this.getActorProperties(actorId);
    
    if (currencyId) {
      // Sum values in specific currency
      return properties
        .filter(p => p.currencyId === currencyId)
        .reduce((sum, p) => sum + p.currentValue, 0);
    } else {
      // Sum all property values (would need exchange rates for accurate total)
      return properties.reduce((sum, p) => sum + p.currentValue, 0);
    }
  }

  /**
   * Delete property (only if unowned)
   */
  deleteProperty(propertyId: string): boolean {
    const property = this.properties.get(propertyId);
    if (!property) return false;

    if (property.status === 'owned') {
      throw new Error('Cannot delete owned property');
    }

    this.properties.delete(propertyId);
    this.saveData();
    
    Hooks.call('foundrybank.propertyDeleted', property);
    return true;
  }

  /**
   * Save data
   */
  private async saveData(): Promise<void> {
    const data = {
      properties: Array.from(this.properties.entries()),
      transactions: Array.from(this.transactions.entries())
    };
    await game.settings.set(this.storageKey, 'propertyData', data);
  }

  /**
   * Load data
   */
  private async loadData(): Promise<void> {
    const data = game.settings.get(this.storageKey, 'propertyData') as any;
    
    if (data?.properties) {
      this.properties = new Map(data.properties);
    }
    if (data?.transactions) {
      this.transactions = new Map(data.transactions);
    }
  }
}

