/**
 * GMManagerDialog - Comprehensive GM management interface
 * @module gm-manager-dialog
 */

import { EconomySystem } from './economy-system.js';
import { BankManager } from './bank-manager.js';
import { PropertyManager } from './property-manager.js';
import { LoanManager } from './loan-manager.js';
import { StockManager } from './stock-manager.js';
import { EconomyManager } from './economy-manager.js';
import { BankerSystem } from './banker-system.js';

export class GMManagerDialog extends Application {
  private economySystem: EconomySystem;
  private bankManager: BankManager;
  private propertyManager: PropertyManager;
  private loanManager: LoanManager;
  private stockManager: StockManager;
  private economyManager: EconomyManager;
  private bankerSystem: BankerSystem;
  private activeTab: string = 'economies';

  constructor(
    economySystem: EconomySystem,
    bankManager: BankManager,
    propertyManager: PropertyManager,
    loanManager: LoanManager,
    stockManager: StockManager,
    economyManager: EconomyManager,
    bankerSystem: BankerSystem
  ) {
    super({
      title: 'FoundryBank - GM Manager',
      template: 'modules/foundrybank/templates/gm-manager-dialog.hbs',
      width: 900,
      height: 800,
      resizable: true
    });

    this.economySystem = economySystem;
    this.bankManager = bankManager;
    this.propertyManager = propertyManager;
    this.loanManager = loanManager;
    this.stockManager = stockManager;
    this.economyManager = economyManager;
    this.bankerSystem = bankerSystem;
  }

  static get defaultOptions(): ApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['foundrybank', 'gm-manager-dialog'],
      width: 900,
      height: 800,
      resizable: true
    });
  }

  getData(): any {
    const economies = this.economySystem.getAllEconomies();
    const banks = this.bankManager.getAllBanks();
    const properties = this.propertyManager.getAllProperties();
    const stocks = this.stockManager.getAllStocks();
    const bankers = this.bankerSystem.getAllBankers();
    const allLoans = Array.from(this.loanManager.getActorLoans('').concat(
      ...game.actors?.map(a => this.loanManager.getActorLoans(a.id)) || []
    ));

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

  activateListeners(html: JQuery): void {
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

  private async showCreateEconomyDialog(): Promise<void> {
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
          callback: async (html: JQuery) => {
            const name = html.find('#economy-name').val() as string;
            const description = html.find('#economy-description').val() as string;
            const type = html.find('#economy-type').val() as string;
            const growthRate = parseFloat(html.find('#economy-growth').val() as string) || 0;
            const interestRate = parseFloat(html.find('#economy-interest').val() as string) || 0.02;

            if (!name) {
              ui.notifications.error('Economy name is required');
              return;
            }

            try {
              this.economySystem.createEconomy(name, description, type as any, growthRate, interestRate);
              ui.notifications.info(`Economy "${name}" created`);
              this.render();
            } catch (error: any) {
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

  private async showCreateCurrencyDialog(economyId: string): Promise<void> {
    const economy = this.economySystem.getEconomy(economyId);
    if (!economy) return;

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
          callback: async (html: JQuery) => {
            const symbol = html.find('#currency-symbol').val() as string;
            const name = html.find('#currency-name').val() as string;
            const pluralName = html.find('#currency-plural').val() as string;
            const exchangeRate = parseFloat(html.find('#currency-rate').val() as string) || 1.0;
            const isBase = html.find('#currency-base').is(':checked');

            if (!symbol || !name) {
              ui.notifications.error('Symbol and name are required');
              return;
            }

            try {
              this.economySystem.createCurrency(economyId, symbol, name, pluralName, exchangeRate, isBase);
              ui.notifications.info(`Currency "${symbol}" created`);
              this.render();
            } catch (error: any) {
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

  private async showCreateBankDialog(): Promise<void> {
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
          callback: async (html: JQuery) => {
            const name = html.find('#bank-name').val() as string;
            const economyId = html.find('#bank-economy').val() as string;
            const description = html.find('#bank-description').val() as string;
            const location = html.find('#bank-location').val() as string;

            if (!name || !economyId) {
              ui.notifications.error('Bank name and economy are required');
              return;
            }

            try {
              this.bankManager.createBank(name, economyId, description, location);
              ui.notifications.info(`Bank "${name}" created`);
              this.render();
            } catch (error: any) {
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

  private async showCreatePropertyDialog(): Promise<void> {
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
          callback: async (html: JQuery) => {
            const name = html.find('#property-name').val() as string;
            const description = html.find('#property-description').val() as string;
            const type = html.find('#property-type').val() as string;
            const economyId = html.find('#property-economy').val() as string;
            const bankId = html.find('#property-bank').val() as string || undefined;
            const price = parseFloat(html.find('#property-price').val() as string) || 0;
            const currencyId = html.find('#property-currency').val() as string;
            const location = html.find('#property-location').val() as string || undefined;
            const income = parseFloat(html.find('#property-income').val() as string) || undefined;
            const expenses = parseFloat(html.find('#property-expenses').val() as string) || undefined;

            if (!name || !economyId || !currencyId || price <= 0) {
              ui.notifications.error('Name, economy, currency, and price are required');
              return;
            }

            try {
              this.propertyManager.createProperty(
                name, description, type as any, economyId, price, currencyId,
                bankId, location, income, expenses
              );
              ui.notifications.info(`Property "${name}" created`);
              this.render();
            } catch (error: any) {
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

  private async showCreateStockDialog(): Promise<void> {
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
          callback: async (html: JQuery) => {
            const symbol = html.find('#stock-symbol').val() as string;
            const name = html.find('#stock-name').val() as string;
            const price = parseFloat(html.find('#stock-price').val() as string) || 0;
            const currencyId = html.find('#stock-currency').val() as string;
            const volatility = parseFloat(html.find('#stock-volatility').val() as string) || 0.1;

            if (!symbol || !name || !currencyId || price <= 0) {
              ui.notifications.error('Symbol, name, currency, and price are required');
              return;
            }

            try {
              const currency = this.economySystem.getCurrency(currencyId);
              this.stockManager.createStock(symbol, name, price, currency?.symbol || 'gp', volatility);
              ui.notifications.info(`Stock "${symbol}" created`);
              this.render();
            } catch (error: any) {
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

  private async showUpdateGrowthDialog(): Promise<void> {
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
          callback: async (html: JQuery) => {
            const growthRate = parseFloat(html.find('#growth-rate').val() as string) || 0;
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

  private async showExchangeRateDialog(): Promise<void> {
    const currencies = Array.from(this.economySystem.getAllEconomies().flatMap(e => 
      this.economySystem.getEconomyCurrencies(e.id)
    ));

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
          callback: async (html: JQuery) => {
            const fromCurrencyId = html.find('#from-currency').val() as string;
            const toCurrencyId = html.find('#to-currency').val() as string;
            const rate = parseFloat(html.find('#exchange-rate').val() as string);

            if (!fromCurrencyId || !toCurrencyId || isNaN(rate) || rate <= 0) {
              ui.notifications.error('Valid currencies and rate are required');
              return;
            }

            try {
              this.economySystem.setExchangeRate(fromCurrencyId, toCurrencyId, rate);
              ui.notifications.info('Exchange rate set');
              this.render();
            } catch (error: any) {
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

  private showEditEconomyDialog(economyId: string): void {
    // Similar to create, but with existing data
    // Implementation similar to create dialog
  }

  private showEditBankDialog(bankId: string): void {
    // Similar to create, but with existing data
  }

  private showEditPropertyDialog(propertyId: string): void {
    // Similar to create, but with existing data
  }

  private async showCreateBankerDialog(): Promise<void> {
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
          callback: async (html: JQuery) => {
            const actorId = html.find('#banker-actor').val() as string;
            const bankId = html.find('#banker-bank').val() as string;
            const title = html.find('#banker-title').val() as string || undefined;
            const description = html.find('#banker-description').val() as string || undefined;

            if (!actorId || !bankId) {
              ui.notifications.error('Actor and bank are required');
              return;
            }

            try {
              this.bankerSystem.registerBanker(actorId, bankId, title, description);
              ui.notifications.info('Banker registered');
              this.render();
            } catch (error: any) {
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

  private removeBanker(actorId: string): void {
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

  private async showUpdatePropertyValueDialog(propertyId: string): Promise<void> {
    const property = this.propertyManager.getProperty(propertyId);
    if (!property) return;

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
          callback: async (html: JQuery) => {
            const newValue = parseFloat(html.find('#property-value').val() as string);
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

