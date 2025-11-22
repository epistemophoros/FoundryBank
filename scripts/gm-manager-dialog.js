/**
 * GMManagerDialog - Comprehensive GM management interface
 * @module gm-manager-dialog
 */
export class GMManagerDialog extends Application {
    constructor(economySystem, bankManager, propertyManager, loanManager, stockManager, economyManager, bankerSystem) {
        super({
            title: 'FoundryBank - GM Manager',
            template: 'modules/foundrybank/templates/gm-manager-dialog.hbs',
            width: 900,
            height: 800,
            resizable: true
        });
        this.activeTab = 'economies';
        this.economySystem = economySystem;
        this.bankManager = bankManager;
        this.propertyManager = propertyManager;
        this.loanManager = loanManager;
        this.stockManager = stockManager;
        this.economyManager = economyManager;
        this.bankerSystem = bankerSystem;
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['foundrybank', 'gm-manager-dialog'],
            width: 900,
            height: 800,
            resizable: true
        });
    }
    getData() {
        const economies = this.economySystem.getAllEconomies();
        const banks = this.bankManager.getAllBanks();
        const properties = this.propertyManager.getAllProperties();
        const stocks = this.stockManager.getAllStocks();
        const bankers = this.bankerSystem.getAllBankers();
        const allLoans = Array.from(this.loanManager.getActorLoans('').concat(...game.actors?.map(a => this.loanManager.getActorLoans(a.id)) || []));
        return {
            activeTab: this.activeTab,
            economies,
            banks,
            properties,
            stocks,
            bankers,
            loans: allLoans,
            economicState: this.economyManager.getEconomicState(),
            canManage: game.user?.isGM
        };
    }
    activateListeners(html) {
        super.activateListeners(html);
        // Tab switching
        html.find('.tab-button').on('click', (event) => {
            const tab = $(event.currentTarget).data('tab');
            this.activeTab = tab;
            this.render();
        });
        // Economy Management
        html.find('.create-economy-btn').on('click', () => this.showCreateEconomyDialog());
        html.find('.edit-economy-btn').on('click', (event) => {
            const economyId = $(event.currentTarget).data('economy-id');
            this.showEditEconomyDialog(economyId);
        });
        html.find('.create-currency-btn').on('click', (event) => {
            const economyId = $(event.currentTarget).data('economy-id');
            this.showCreateCurrencyDialog(economyId);
        });
        // Bank Management
        html.find('.create-bank-btn').on('click', () => this.showCreateBankDialog());
        html.find('.edit-bank-btn').on('click', (event) => {
            const bankId = $(event.currentTarget).data('bank-id');
            this.showEditBankDialog(bankId);
        });
        // Property Management
        html.find('.create-property-btn').on('click', () => this.showCreatePropertyDialog());
        html.find('.edit-property-btn').on('click', (event) => {
            const propertyId = $(event.currentTarget).data('property-id');
            this.showEditPropertyDialog(propertyId);
        });
        html.find('.update-property-value-btn').on('click', (event) => {
            const propertyId = $(event.currentTarget).data('property-id');
            this.showUpdatePropertyValueDialog(propertyId);
        });
        // Stock Management
        html.find('.create-stock-btn').on('click', () => this.showCreateStockDialog());
        html.find('.update-stock-prices-btn').on('click', () => {
            this.stockManager.updateStockPrices();
            ui.notifications.info('Stock prices updated');
            this.render();
        });
        // Economic Growth
        html.find('.update-growth-btn').on('click', () => this.showUpdateGrowthDialog());
        // Exchange Rates
        html.find('.set-exchange-rate-btn').on('click', () => this.showExchangeRateDialog());
        // Banker Management
        html.find('.create-banker-btn').on('click', () => this.showCreateBankerDialog());
        html.find('.remove-banker-btn').on('click', (event) => {
            const actorId = $(event.currentTarget).data('actor-id');
            this.removeBanker(actorId);
        });
        // Refresh
        html.find('.refresh-btn').on('click', () => this.render());
    }
    async showCreateEconomyDialog() {
        const content = await renderTemplate('modules/foundrybank/templates/create-economy-dialog.hbs', {
            types: ['kingdom', 'faction', 'region', 'city', 'custom']
        });
        new Dialog({
            title: 'Create Economy',
            content,
            buttons: {
                create: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Create',
                    callback: async (html) => {
                        const name = html.find('#economy-name').val();
                        const description = html.find('#economy-description').val();
                        const type = html.find('#economy-type').val();
                        const growthRate = parseFloat(html.find('#economy-growth').val()) || 0;
                        const interestRate = parseFloat(html.find('#economy-interest').val()) || 0.02;
                        if (!name) {
                            ui.notifications.error('Economy name is required');
                            return;
                        }
                        try {
                            this.economySystem.createEconomy(name, description, type, growthRate, interestRate);
                            ui.notifications.info(`Economy "${name}" created`);
                            this.render();
                        }
                        catch (error) {
                            ui.notifications.error(error.message);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel'
                }
            },
            default: 'create'
        }).render(true);
    }
    async showCreateCurrencyDialog(economyId) {
        const economy = this.economySystem.getEconomy(economyId);
        if (!economy)
            return;
        const content = await renderTemplate('modules/foundrybank/templates/create-currency-dialog.hbs', {
            economy
        });
        new Dialog({
            title: 'Create Currency',
            content,
            buttons: {
                create: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Create',
                    callback: async (html) => {
                        const symbol = html.find('#currency-symbol').val();
                        const name = html.find('#currency-name').val();
                        const pluralName = html.find('#currency-plural').val();
                        const exchangeRate = parseFloat(html.find('#currency-rate').val()) || 1.0;
                        const isBase = html.find('#currency-base').is(':checked');
                        if (!symbol || !name) {
                            ui.notifications.error('Symbol and name are required');
                            return;
                        }
                        try {
                            this.economySystem.createCurrency(economyId, symbol, name, pluralName, exchangeRate, isBase);
                            ui.notifications.info(`Currency "${symbol}" created`);
                            this.render();
                        }
                        catch (error) {
                            ui.notifications.error(error.message);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel'
                }
            },
            default: 'create'
        }).render(true);
    }
    async showCreateBankDialog() {
        const economies = this.economySystem.getActiveEconomies();
        const content = await renderTemplate('modules/foundrybank/templates/create-bank-dialog.hbs', {
            economies
        });
        new Dialog({
            title: 'Create Bank',
            content,
            buttons: {
                create: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Create',
                    callback: async (html) => {
                        const name = html.find('#bank-name').val();
                        const economyId = html.find('#bank-economy').val();
                        const description = html.find('#bank-description').val();
                        const location = html.find('#bank-location').val();
                        if (!name || !economyId) {
                            ui.notifications.error('Bank name and economy are required');
                            return;
                        }
                        try {
                            this.bankManager.createBank(name, economyId, description, location);
                            ui.notifications.info(`Bank "${name}" created`);
                            this.render();
                        }
                        catch (error) {
                            ui.notifications.error(error.message);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel'
                }
            },
            default: 'create'
        }).render(true);
    }
    async showCreatePropertyDialog() {
        const economies = this.economySystem.getActiveEconomies();
        const banks = this.bankManager.getAllBanks();
        const content = await renderTemplate('modules/foundrybank/templates/create-property-dialog.hbs', {
            economies,
            banks,
            types: ['real_estate', 'business', 'land', 'ship', 'vehicle', 'equipment', 'custom']
        });
        new Dialog({
            title: 'Create Property',
            content,
            buttons: {
                create: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Create',
                    callback: async (html) => {
                        const name = html.find('#property-name').val();
                        const description = html.find('#property-description').val();
                        const type = html.find('#property-type').val();
                        const economyId = html.find('#property-economy').val();
                        const bankId = html.find('#property-bank').val() || undefined;
                        const price = parseFloat(html.find('#property-price').val()) || 0;
                        const currencyId = html.find('#property-currency').val();
                        const location = html.find('#property-location').val() || undefined;
                        const income = parseFloat(html.find('#property-income').val()) || undefined;
                        const expenses = parseFloat(html.find('#property-expenses').val()) || undefined;
                        if (!name || !economyId || !currencyId || price <= 0) {
                            ui.notifications.error('Name, economy, currency, and price are required');
                            return;
                        }
                        try {
                            this.propertyManager.createProperty(name, description, type, economyId, price, currencyId, bankId, location, income, expenses);
                            ui.notifications.info(`Property "${name}" created`);
                            this.render();
                        }
                        catch (error) {
                            ui.notifications.error(error.message);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel'
                }
            },
            default: 'create'
        }).render(true);
    }
    async showCreateStockDialog() {
        const economies = this.economySystem.getActiveEconomies();
        const content = await renderTemplate('modules/foundrybank/templates/create-stock-dialog.hbs', {
            economies
        });
        new Dialog({
            title: 'Create Stock',
            content,
            buttons: {
                create: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Create',
                    callback: async (html) => {
                        const symbol = html.find('#stock-symbol').val();
                        const name = html.find('#stock-name').val();
                        const price = parseFloat(html.find('#stock-price').val()) || 0;
                        const currencyId = html.find('#stock-currency').val();
                        const volatility = parseFloat(html.find('#stock-volatility').val()) || 0.1;
                        if (!symbol || !name || !currencyId || price <= 0) {
                            ui.notifications.error('Symbol, name, currency, and price are required');
                            return;
                        }
                        try {
                            const currency = this.economySystem.getCurrency(currencyId);
                            this.stockManager.createStock(symbol, name, price, currency?.symbol || 'gp', volatility);
                            ui.notifications.info(`Stock "${symbol}" created`);
                            this.render();
                        }
                        catch (error) {
                            ui.notifications.error(error.message);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel'
                }
            },
            default: 'create'
        }).render(true);
    }
    async showUpdateGrowthDialog() {
        const currentState = this.economyManager.getEconomicState();
        const content = await renderTemplate('modules/foundrybank/templates/update-growth-dialog.hbs', {
            currentGrowth: currentState.growthRate
        });
        new Dialog({
            title: 'Update Economic Growth',
            content,
            buttons: {
                update: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Update',
                    callback: async (html) => {
                        const growthRate = parseFloat(html.find('#growth-rate').val()) || 0;
                        this.economyManager.updateEconomicGrowth(growthRate);
                        ui.notifications.info(`Economic growth set to ${(growthRate * 100).toFixed(1)}%`);
                        this.render();
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel'
                }
            },
            default: 'update'
        }).render(true);
    }
    async showExchangeRateDialog() {
        const currencies = Array.from(this.economySystem.getAllEconomies().flatMap(e => this.economySystem.getEconomyCurrencies(e.id)));
        const content = await renderTemplate('modules/foundrybank/templates/exchange-rate-dialog.hbs', {
            currencies
        });
        new Dialog({
            title: 'Set Exchange Rate',
            content,
            buttons: {
                set: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Set Rate',
                    callback: async (html) => {
                        const fromCurrencyId = html.find('#from-currency').val();
                        const toCurrencyId = html.find('#to-currency').val();
                        const rate = parseFloat(html.find('#exchange-rate').val());
                        if (!fromCurrencyId || !toCurrencyId || isNaN(rate) || rate <= 0) {
                            ui.notifications.error('Valid currencies and rate are required');
                            return;
                        }
                        try {
                            this.economySystem.setExchangeRate(fromCurrencyId, toCurrencyId, rate);
                            ui.notifications.info('Exchange rate set');
                            this.render();
                        }
                        catch (error) {
                            ui.notifications.error(error.message);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel'
                }
            },
            default: 'set'
        }).render(true);
    }
    showEditEconomyDialog(economyId) {
        // Similar to create, but with existing data
        // Implementation similar to create dialog
    }
    showEditBankDialog(bankId) {
        // Similar to create, but with existing data
    }
    showEditPropertyDialog(propertyId) {
        // Similar to create, but with existing data
    }
    async showCreateBankerDialog() {
        const actors = game.actors?.filter(a => a.type === 'npc') || [];
        const banks = this.bankManager.getAllBanks();
        const content = await renderTemplate('modules/foundrybank/templates/create-banker-dialog.hbs', {
            actors,
            banks
        });
        new Dialog({
            title: 'Register Banker',
            content,
            buttons: {
                register: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Register',
                    callback: async (html) => {
                        const actorId = html.find('#banker-actor').val();
                        const bankId = html.find('#banker-bank').val();
                        const title = html.find('#banker-title').val() || undefined;
                        const description = html.find('#banker-description').val() || undefined;
                        if (!actorId || !bankId) {
                            ui.notifications.error('Actor and bank are required');
                            return;
                        }
                        try {
                            this.bankerSystem.registerBanker(actorId, bankId, title, description);
                            ui.notifications.info('Banker registered');
                            this.render();
                        }
                        catch (error) {
                            ui.notifications.error(error.message);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel'
                }
            },
            default: 'register'
        }).render(true);
    }
    removeBanker(actorId) {
        new Dialog({
            title: 'Remove Banker',
            content: '<p>Are you sure you want to remove this banker?</p>',
            buttons: {
                remove: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: 'Remove',
                    callback: () => {
                        this.bankerSystem.unregisterBanker(actorId);
                        ui.notifications.info('Banker removed');
                        this.render();
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel'
                }
            },
            default: 'cancel'
        }).render(true);
    }
    async showUpdatePropertyValueDialog(propertyId) {
        const property = this.propertyManager.getProperty(propertyId);
        if (!property)
            return;
        const content = await renderTemplate('modules/foundrybank/templates/update-property-value-dialog.hbs', {
            property
        });
        new Dialog({
            title: 'Update Property Value',
            content,
            buttons: {
                update: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Update',
                    callback: async (html) => {
                        const newValue = parseFloat(html.find('#property-value').val());
                        if (isNaN(newValue) || newValue < 0) {
                            ui.notifications.error('Valid value required');
                            return;
                        }
                        this.propertyManager.updatePropertyValue(propertyId, newValue);
                        ui.notifications.info('Property value updated');
                        this.render();
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel'
                }
            },
            default: 'update'
        }).render(true);
    }
}
