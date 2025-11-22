/**
 * BankSettings - Module settings configuration
 * @module bank-settings
 */
export class BankSettings {
    /**
     * Register all module settings
     */
    static register() {
        // Default currency setting
        game.settings.register('foundrybank', 'defaultCurrency', {
            name: game.i18n.localize('FOUNDRYBANK.Settings.DefaultCurrency.Name'),
            hint: game.i18n.localize('FOUNDRYBANK.Settings.DefaultCurrency.Hint'),
            scope: 'world',
            config: true,
            type: String,
            default: 'gp',
            choices: {
                'gp': 'Gold Pieces (gp)',
                'sp': 'Silver Pieces (sp)',
                'cp': 'Copper Pieces (cp)',
                'pp': 'Platinum Pieces (pp)'
            }
        });
        // Enable transaction logging
        game.settings.register('foundrybank', 'enableLogging', {
            name: game.i18n.localize('FOUNDRYBANK.Settings.EnableLogging.Name'),
            hint: game.i18n.localize('FOUNDRYBANK.Settings.EnableLogging.Hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: true
        });
        // Transaction history limit
        game.settings.register('foundrybank', 'transactionHistoryLimit', {
            name: game.i18n.localize('FOUNDRYBANK.Settings.TransactionHistoryLimit.Name'),
            hint: game.i18n.localize('FOUNDRYBANK.Settings.TransactionHistoryLimit.Hint'),
            scope: 'world',
            config: true,
            type: Number,
            default: 100,
            range: {
                min: 10,
                max: 1000,
                step: 10
            }
        });
        // Bank data storage (internal, not user-facing)
        game.settings.register('foundrybank', 'bankData', {
            scope: 'world',
            config: false,
            type: Object,
            default: {
                accounts: [],
                transactions: []
            }
        });
        // Enable shift-click to open bank
        game.settings.register('foundrybank', 'enableShiftClick', {
            name: game.i18n.localize('FOUNDRYBANK.Settings.EnableShiftClick.Name'),
            hint: game.i18n.localize('FOUNDRYBANK.Settings.EnableShiftClick.Hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: true
        });
        // Interest rate setting
        game.settings.register('foundrybank', 'interestRate', {
            name: game.i18n.localize('FOUNDRYBANK.Settings.InterestRate.Name'),
            hint: game.i18n.localize('FOUNDRYBANK.Settings.InterestRate.Hint'),
            scope: 'world',
            config: true,
            type: Number,
            default: 0.02,
            range: {
                min: 0,
                max: 0.5,
                step: 0.01
            }
        });
        // Enable interest on deposits
        game.settings.register('foundrybank', 'enableInterest', {
            name: game.i18n.localize('FOUNDRYBANK.Settings.EnableInterest.Name'),
            hint: game.i18n.localize('FOUNDRYBANK.Settings.EnableInterest.Hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: true
        });
        // Enable D&D 5e currency sync
        game.settings.register('foundrybank', 'enableDnd5eSync', {
            name: game.i18n.localize('FOUNDRYBANK.Settings.EnableDnd5eSync.Name'),
            hint: game.i18n.localize('FOUNDRYBANK.Settings.EnableDnd5eSync.Hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: true
        });
        // Economic growth rate
        game.settings.register('foundrybank', 'economicGrowthRate', {
            name: game.i18n.localize('FOUNDRYBANK.Settings.EconomicGrowthRate.Name'),
            hint: game.i18n.localize('FOUNDRYBANK.Settings.EconomicGrowthRate.Hint'),
            scope: 'world',
            config: true,
            type: Number,
            default: 0.0,
            range: {
                min: -1.0,
                max: 1.0,
                step: 0.1
            }
        });
        // Economic state storage (internal)
        game.settings.register('foundrybank', 'economicState', {
            scope: 'world',
            config: false,
            type: Object,
            default: {
                growthRate: 0.0,
                baseInterestRate: 0.02,
                inflationRate: 0.0,
                lastUpdate: Date.now()
            }
        });
        // Loan data storage (internal)
        game.settings.register('foundrybank', 'loanData', {
            scope: 'world',
            config: false,
            type: Object,
            default: {
                loans: []
            }
        });
        // Stock data storage (internal)
        game.settings.register('foundrybank', 'stockData', {
            scope: 'world',
            config: false,
            type: Object,
            default: {
                stocks: [],
                holdings: []
            }
        });
        // Economy system data storage (internal)
        game.settings.register('foundrybank', 'economyData', {
            scope: 'world',
            config: false,
            type: Object,
            default: {
                economies: [],
                currencies: [],
                exchangeRates: []
            }
        });
        // Property data storage (internal)
        game.settings.register('foundrybank', 'propertyData', {
            scope: 'world',
            config: false,
            type: Object,
            default: {
                properties: [],
                transactions: []
            }
        });
        // Banker data storage (internal)
        game.settings.register('foundrybank', 'bankerData', {
            scope: 'world',
            config: false,
            type: Object,
            default: {
                bankers: []
            }
        });
    }
    /**
     * Get default currency
     */
    static getDefaultCurrency() {
        return game.settings.get('foundrybank', 'defaultCurrency');
    }
    /**
     * Check if logging is enabled
     */
    static isLoggingEnabled() {
        return game.settings.get('foundrybank', 'enableLogging');
    }
    /**
     * Get transaction history limit
     */
    static getTransactionHistoryLimit() {
        return game.settings.get('foundrybank', 'transactionHistoryLimit');
    }
    /**
     * Check if shift-click is enabled
     */
    static isShiftClickEnabled() {
        return game.settings.get('foundrybank', 'enableShiftClick');
    }
}
