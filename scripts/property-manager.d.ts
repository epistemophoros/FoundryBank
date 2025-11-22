/**
 * PropertyManager - Manages properties, assets, and real estate
 * @module property-manager
 */
export interface Property {
    id: string;
    name: string;
    description: string;
    type: 'real_estate' | 'business' | 'land' | 'ship' | 'vehicle' | 'equipment' | 'custom';
    economyId: string;
    bankId?: string;
    currencyId: string;
    purchasePrice: number;
    currentValue: number;
    ownerId?: string;
    location?: string;
    purchasedAt?: number;
    purchasedBy?: string;
    income?: number;
    expenses?: number;
    status: 'available' | 'owned' | 'rented' | 'maintenance' | 'sold';
    metadata?: Record<string, any>;
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
    fromAccountId?: string;
    toAccountId?: string;
}
export declare class PropertyManager {
    private properties;
    private transactions;
    private storageKey;
    /**
     * Initialize the PropertyManager
     */
    initialize(): Promise<void>;
    /**
     * Create a new property
     */
    createProperty(name: string, description: string, type: Property['type'], economyId: string, purchasePrice: number, currencyId: string, bankId?: string, location?: string, income?: number, expenses?: number): Property;
    /**
     * Get all properties
     */
    getAllProperties(): Property[];
    /**
     * Get properties by economy
     */
    getEconomyProperties(economyId: string): Property[];
    /**
     * Get properties by bank
     */
    getBankProperties(bankId: string): Property[];
    /**
     * Get available properties (not owned)
     */
    getAvailableProperties(economyId?: string): Property[];
    /**
     * Get properties owned by an actor
     */
    getActorProperties(actorId: string): Property[];
    /**
     * Get property by ID
     */
    getProperty(propertyId: string): Property | undefined;
    /**
     * Purchase a property (withdraws from bank account automatically)
     */
    purchaseProperty(propertyId: string, actorId: string, accountId: string, purchasePrice?: number, bankManager?: any): Promise<PropertyTransaction>;
    /**
     * Sell a property (deposits to bank account automatically)
     */
    sellProperty(propertyId: string, actorId: string, salePrice: number, toAccountId?: string, bankManager?: any): Promise<PropertyTransaction>;
    /**
     * Update property value
     */
    updatePropertyValue(propertyId: string, newValue: number): void;
    /**
     * Set property income/expenses
     */
    updatePropertyFinancials(propertyId: string, income?: number, expenses?: number): void;
    /**
     * Record property income
     */
    recordIncome(propertyId: string, amount: number, description?: string): PropertyTransaction;
    /**
     * Record property expenses
     */
    recordExpense(propertyId: string, amount: number, description?: string): PropertyTransaction;
    /**
     * Get property transactions
     */
    getPropertyTransactions(propertyId: string): PropertyTransaction[];
    /**
     * Get actor property transactions
     */
    getActorPropertyTransactions(actorId: string): PropertyTransaction[];
    /**
     * Calculate property net worth for an actor
     */
    calculateActorPropertyValue(actorId: string, currencyId?: string): number;
    /**
     * Delete property (only if unowned)
     */
    deleteProperty(propertyId: string): boolean;
    /**
     * Save data
     */
    private saveData;
    /**
     * Load data
     */
    private loadData;
}
