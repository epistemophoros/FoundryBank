/**
 * PropertyManager - Manages properties, assets, and real estate
 * @module property-manager
 */
export class PropertyManager {
    constructor() {
        this.properties = new Map();
        this.transactions = new Map();
        this.storageKey = 'foundrybank';
    }
    /**
     * Initialize the PropertyManager
     */
    async initialize() {
        await this.loadData();
        console.log(`FoundryBank | Loaded ${this.properties.size} properties`);
    }
    /**
     * Create a new property
     */
    createProperty(name, description, type, economyId, purchasePrice, currencyId, bankId, location, income, expenses) {
        const propertyId = `property_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const property = {
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
    getAllProperties() {
        return Array.from(this.properties.values());
    }
    /**
     * Get properties by economy
     */
    getEconomyProperties(economyId) {
        return Array.from(this.properties.values()).filter(p => p.economyId === economyId);
    }
    /**
     * Get properties by bank
     */
    getBankProperties(bankId) {
        return Array.from(this.properties.values()).filter(p => p.bankId === bankId);
    }
    /**
     * Get available properties (not owned)
     */
    getAvailableProperties(economyId) {
        const all = economyId
            ? this.getEconomyProperties(economyId)
            : this.getAllProperties();
        return all.filter(p => p.status === 'available');
    }
    /**
     * Get properties owned by an actor
     */
    getActorProperties(actorId) {
        return Array.from(this.properties.values()).filter(p => p.ownerId === actorId);
    }
    /**
     * Get property by ID
     */
    getProperty(propertyId) {
        return this.properties.get(propertyId);
    }
    /**
     * Purchase a property (withdraws from bank account automatically)
     */
    async purchaseProperty(propertyId, actorId, accountId, purchasePrice, bankManager // BankManager instance for account withdrawal
    ) {
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
                const economySystem = game.foundrybank?.getEconomySystem?.();
                if (economySystem) {
                    const exchangeRate = economySystem.getExchangeRate(account.currencyId, property.currencyId);
                    const convertedPrice = price / exchangeRate;
                    if (account.balance < convertedPrice) {
                        throw new Error(`Insufficient funds after currency conversion. Need ${convertedPrice} ${account.currencyId}, have ${account.balance}`);
                    }
                    // Withdraw converted amount
                    await bankManager.withdraw(accountId, convertedPrice, `Property purchase: ${property.name}`);
                }
                else {
                    throw new Error('Currency mismatch and no exchange rate system available');
                }
            }
            else {
                // Same currency, direct withdrawal
                await bankManager.withdraw(accountId, price, `Property purchase: ${property.name}`);
            }
        }
        // Create transaction record
        const transaction = {
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
    async sellProperty(propertyId, actorId, salePrice, toAccountId, bankManager // BankManager instance for account deposit
    ) {
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
                const economySystem = game.foundrybank?.getEconomySystem?.();
                if (economySystem) {
                    const exchangeRate = economySystem.getExchangeRate(property.currencyId, account.currencyId);
                    const convertedAmount = salePrice * exchangeRate;
                    // Deposit converted amount
                    await bankManager.deposit(toAccountId, convertedAmount, `Property sale: ${property.name}`);
                }
                else {
                    throw new Error('Currency mismatch and no exchange rate system available');
                }
            }
            else {
                // Same currency, direct deposit
                await bankManager.deposit(toAccountId, salePrice, `Property sale: ${property.name}`);
            }
        }
        // Create transaction record
        const transaction = {
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
    updatePropertyValue(propertyId, newValue) {
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
    updatePropertyFinancials(propertyId, income, expenses) {
        const property = this.properties.get(propertyId);
        if (!property) {
            throw new Error(`Property ${propertyId} not found`);
        }
        if (income !== undefined)
            property.income = income;
        if (expenses !== undefined)
            property.expenses = expenses;
        this.saveData();
        Hooks.call('foundrybank.propertyFinancialsUpdated', property);
    }
    /**
     * Record property income
     */
    recordIncome(propertyId, amount, description = '') {
        const property = this.properties.get(propertyId);
        if (!property) {
            throw new Error(`Property ${propertyId} not found`);
        }
        const transaction = {
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
    recordExpense(propertyId, amount, description = '') {
        const property = this.properties.get(propertyId);
        if (!property) {
            throw new Error(`Property ${propertyId} not found`);
        }
        const transaction = {
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
    getPropertyTransactions(propertyId) {
        return Array.from(this.transactions.values())
            .filter(txn => txn.propertyId === propertyId)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
    /**
     * Get actor property transactions
     */
    getActorPropertyTransactions(actorId) {
        return Array.from(this.transactions.values())
            .filter(txn => txn.actorId === actorId)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
    /**
     * Calculate property net worth for an actor
     */
    calculateActorPropertyValue(actorId, currencyId) {
        const properties = this.getActorProperties(actorId);
        if (currencyId) {
            // Sum values in specific currency
            return properties
                .filter(p => p.currencyId === currencyId)
                .reduce((sum, p) => sum + p.currentValue, 0);
        }
        else {
            // Sum all property values (would need exchange rates for accurate total)
            return properties.reduce((sum, p) => sum + p.currentValue, 0);
        }
    }
    /**
     * Delete property (only if unowned)
     */
    deleteProperty(propertyId) {
        const property = this.properties.get(propertyId);
        if (!property)
            return false;
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
    async saveData() {
        const data = {
            properties: Array.from(this.properties.entries()),
            transactions: Array.from(this.transactions.entries())
        };
        await game.settings.set(this.storageKey, 'propertyData', data);
    }
    /**
     * Load data
     */
    async loadData() {
        const data = game.settings.get(this.storageKey, 'propertyData');
        if (data?.properties) {
            this.properties = new Map(data.properties);
        }
        if (data?.transactions) {
            this.transactions = new Map(data.transactions);
        }
    }
}
