/// <reference path="./types.d.ts" />
/**
 * FoundryBank - A comprehensive banking system for Foundry VTT
 * @module foundrybank
 */
import { BankManager } from './bank-manager.js';
import { BankDialog } from './bank-dialog.js';
import { BankSettings } from './bank-settings.js';
import { registerHandlebarsHelpers } from './handlebars-helpers.js';
import { EconomyManager } from './economy-manager.js';
import { LoanManager } from './loan-manager.js';
import { StockManager } from './stock-manager.js';
import { EconomySystem } from './economy-system.js';
import { PropertyManager } from './property-manager.js';
import { GMManagerDialog } from './gm-manager-dialog.js';
import { BankerSystem } from './banker-system.js';
export class FoundryBank {
    /**
     * Initialize the FoundryBank module
     */
    static async init() {
        if (this.initialized)
            return;
        console.log('FoundryBank | Initializing...');
        // Register settings FIRST - systems need them to load data
        BankSettings.register();
        // Register Handlebars helpers
        registerHandlebarsHelpers();
        // Initialize Economy System first (framework for economies/currencies)
        this.economySystem = new EconomySystem();
        await this.economySystem.initialize();
        // Initialize Economy Manager (for growth/interest calculations)
        this.economyManager = new EconomyManager();
        await this.economyManager.initialize();
        // Initialize Bank Manager (with EconomySystem reference)
        this.bankManager = new BankManager();
        // Set EconomySystem reference for currency conversions
        this.bankManager.economySystem = this.economySystem;
        await this.bankManager.initialize();
        // Initialize Loan Manager
        this.loanManager = new LoanManager(this.economyManager);
        await this.loanManager.initialize();
        // Initialize Stock Manager
        this.stockManager = new StockManager(this.economyManager);
        await this.stockManager.initialize();
        // Initialize Property Manager
        this.propertyManager = new PropertyManager();
        await this.propertyManager.initialize();
        // Initialize Banker System
        this.bankerSystem = new BankerSystem();
        await this.bankerSystem.initialize();
        // Register hooks
        this.registerHooks();
        // Register token controls
        this.registerTokenControls();
        this.initialized = true;
        console.log('FoundryBank | Initialized successfully');
    }
    /**
     * Register all module hooks
     */
    static registerHooks() {
        // Hook into token click events
        Hooks.on('clickToken', (token, event) => {
            if (!token.actor)
                return;
            // Check if actor is a banker (right-click or shift-click)
            const isBanker = this.bankerSystem.isBanker(token.actor.id);
            if (isBanker && (event.button === 0 || event.button === 2)) {
                // Left-click or right-click on banker opens bank
                event.preventDefault();
                event.stopPropagation();
                this.openBankDialogFromBanker(token);
            }
            else if (BankSettings.isShiftClickEnabled() && event.shiftKey && event.button === 0) {
                // Shift-click on any token opens bank (if enabled)
                event.preventDefault();
                event.stopPropagation();
                this.openBankDialog(token);
            }
        });
        // Hook into token HUD
        Hooks.on('renderTokenHUD', (hud, html, token) => {
            this.addTokenHUDButton(hud, html, token);
            // Add banker interaction button if actor is a banker
            if (token.actor && this.bankerSystem.isBanker(token.actor.id)) {
                this.addBankerHUDButton(hud, html, token);
            }
        });
        // Hook into actor sheet rendering to add banker button
        Hooks.on('renderActorSheet', (sheet, html, data) => {
            if (this.bankerSystem.isBanker(sheet.actor.id)) {
                this.addBankerSheetButton(sheet, html);
            }
        });
        // Hook into ready state
        Hooks.once('ready', () => {
            console.log('FoundryBank | Ready');
            // Add GM Manager button to settings menu
            if (game.user?.isGM) {
                this.addGMManagerButton();
                this.addGMManagerMenuItem();
            }
        });
        // Hook into actor updates to sync bank data
        Hooks.on('updateActor', (actor, data) => {
            if (data.system?.currency) {
                // Sync currency changes with bank if needed
                this.bankManager.syncActorCurrency(actor);
            }
        });
        // Hook for daily interest calculation (can be triggered by GM or time-based)
        Hooks.on('foundrybank.calculateInterest', async () => {
            const interestRate = game.settings.get('foundrybank', 'enableInterest')
                ? (game.settings.get('foundrybank', 'interestRate') || 0.02)
                : 0;
            if (interestRate > 0) {
                await this.bankManager.calculateAllInterest(interestRate);
            }
        });
        // Hook for stock price updates (can be triggered periodically)
        Hooks.on('foundrybank.updateStocks', () => {
            this.stockManager.updateStockPrices();
        });
    }
    /**
     * Register token control buttons
     */
    static registerTokenControls() {
        // Add control button for opening bank
        if (game.modules.get('foundrybank')?.active) {
            // This will be handled by the token HUD hook
        }
    }
    /**
     * Add GM Manager button to settings menu
     */
    static addGMManagerButton() {
        // Add to settings menu
        Hooks.on('renderSettings', (app, html) => {
            const foundrybankSettings = html.find('#settings-foundrybank');
            if (foundrybankSettings.length) {
                const managerButton = $(`
          <button type="button" class="foundrybank-gm-manager-btn" style="margin-top: 10px; width: 100%;">
            <i class="fas fa-cog"></i> Open FoundryBank Manager
          </button>
        `);
                managerButton.on('click', () => {
                    this.openGMManagerDialog();
                });
                foundrybankSettings.append(managerButton);
            }
        });
    }
    /**
     * Add GM Manager menu item to settings navigation
     */
    static addGMManagerMenuItem() {
        Hooks.on('renderSettings', (app, html) => {
            // Add menu item in the settings navigation
            const nav = html.find('.settings-nav');
            if (nav.length && !html.find('.foundrybank-manager-menu-item').length) {
                const menuItem = $(`
          <a class="item foundrybank-manager-menu-item" data-tab="foundrybank-manager">
            <i class="fas fa-university"></i> FoundryBank Manager
          </a>
        `);
                menuItem.on('click', (event) => {
                    event.preventDefault();
                    this.openGMManagerDialog();
                });
                nav.append(menuItem);
            }
        });
    }
    /**
     * Add bank button to token HUD
     */
    static addTokenHUDButton(hud, html, token) {
        const bankButton = $(`
      <div class="control-icon bank-icon" data-action="open-bank" 
           title="${game.i18n.localize('FOUNDRYBANK.OpenBank')}">
        <i class="fas fa-university"></i>
      </div>
    `);
        html.find('.col.left').append(bankButton);
        bankButton.on('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.openBankDialog(token);
        });
    }
    /**
     * Open bank dialog for a token
     */
    static openBankDialog(token) {
        if (!token.actor) {
            ui.notifications.warn(game.i18n.localize('FOUNDRYBANK.NoActor'));
            return;
        }
        const dialog = new BankDialog(token.actor, this.bankManager);
        dialog.render(true);
    }
    /**
     * Open bank dialog from banker NPC
     */
    static openBankDialogFromBanker(token) {
        if (!token.actor) {
            ui.notifications.warn(game.i18n.localize('FOUNDRYBANK.NoActor'));
            return;
        }
        const banker = this.bankerSystem.getBanker(token.actor.id);
        if (!banker) {
            ui.notifications.warn('This NPC is not registered as a banker');
            return;
        }
        const bank = this.bankManager.getBank(banker.bankId);
        if (!bank) {
            ui.notifications.error('Bank not found');
            return;
        }
        // Open bank dialog for the player's character
        // For now, open for the actor that owns the token, or first owned actor
        const playerActor = game.user?.character || game.actors?.owned().find(a => a.isOwner);
        if (!playerActor) {
            ui.notifications.warn('No character found to open bank for');
            return;
        }
        // Show banker greeting
        const bankerName = banker.title ? `${banker.name}, ${banker.title}` : banker.name;
        ui.notifications.info(`Welcome to ${bank.name}! How may ${bankerName} assist you today?`);
        const dialog = new BankDialog(playerActor, this.bankManager);
        dialog.render(true);
    }
    /**
     * Add banker button to token HUD
     */
    static addBankerHUDButton(hud, html, token) {
        const bankerButton = $(`
      <div class="control-icon banker-icon" data-action="open-bank" 
           title="Talk to Banker - Open Bank">
        <i class="fas fa-hand-holding-usd"></i>
      </div>
    `);
        html.find('.col.left').append(bankerButton);
        bankerButton.on('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.openBankDialogFromBanker(token);
        });
    }
    /**
     * Add banker button to actor sheet
     */
    static addBankerSheetButton(sheet, html) {
        const banker = this.bankerSystem.getBanker(sheet.actor.id);
        if (!banker)
            return;
        const bank = this.bankManager.getBank(banker.bankId);
        if (!bank)
            return;
        const bankerButton = $(`
      <button type="button" class="foundrybank-banker-button" style="margin: 5px;">
        <i class="fas fa-university"></i> Open ${bank.name}
      </button>
    `);
        bankerButton.on('click', () => {
            const playerActor = game.user?.character || game.actors?.owned().find(a => a.isOwner);
            if (playerActor) {
                const dialog = new BankDialog(playerActor, this.bankManager);
                dialog.render(true);
            }
        });
        // Add to sheet header or appropriate location
        html.find('.window-header').after(bankerButton);
    }
    /**
     * Open GM Manager Dialog
     */
    static openGMManagerDialog() {
        if (!game.user?.isGM) {
            ui.notifications.warn('Only GMs can access the manager');
            return;
        }
        const dialog = new GMManagerDialog(this.economySystem, this.bankManager, this.propertyManager, this.loanManager, this.stockManager, this.economyManager, this.bankerSystem);
        dialog.render(true);
    }
    /**
     * Get the BankManager instance
     */
    static getBankManager() {
        return this.bankManager;
    }
    /**
     * Get the EconomyManager instance
     */
    static getEconomyManager() {
        return this.economyManager;
    }
    /**
     * Get the LoanManager instance
     */
    static getLoanManager() {
        return this.loanManager;
    }
    /**
     * Get the StockManager instance
     */
    static getStockManager() {
        return this.stockManager;
    }
    /**
     * Get the EconomySystem instance
     */
    static getEconomySystem() {
        return this.economySystem;
    }
    /**
     * Get the PropertyManager instance
     */
    static getPropertyManager() {
        return this.propertyManager;
    }
    /**
     * Get the BankerSystem instance
     */
    static getBankerSystem() {
        return this.bankerSystem;
    }
}
FoundryBank.initialized = false;
// Initialize when module is ready
Hooks.once('init', () => {
    FoundryBank.init();
});
// Export API for other modules
// Game interface is already declared in types.d.ts
// Register API
Hooks.once('ready', () => {
    if (game.modules.get('foundrybank')?.active) {
        game.foundrybank = {
            getBankManager: () => FoundryBank.getBankManager(),
            getEconomySystem: () => FoundryBank.getEconomySystem(),
            getEconomyManager: () => FoundryBank.getEconomyManager(),
            getLoanManager: () => FoundryBank.getLoanManager(),
            getStockManager: () => FoundryBank.getStockManager(),
            getPropertyManager: () => FoundryBank.getPropertyManager(),
            getBankerSystem: () => FoundryBank.getBankerSystem(),
            openBankDialog: (token) => FoundryBank.openBankDialog(token),
            openBankDialogFromBanker: (token) => FoundryBank.openBankDialogFromBanker(token)
        };
    }
});
