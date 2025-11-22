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
export declare class GMManagerDialog extends Application {
    private economySystem;
    private bankManager;
    private propertyManager;
    private loanManager;
    private stockManager;
    private economyManager;
    private bankerSystem;
    private activeTab;
    constructor(economySystem: EconomySystem, bankManager: BankManager, propertyManager: PropertyManager, loanManager: LoanManager, stockManager: StockManager, economyManager: EconomyManager, bankerSystem: BankerSystem);
    static get defaultOptions(): ApplicationOptions;
    getData(): any;
    activateListeners(html: JQuery): void;
    private showCreateEconomyDialog;
    private showCreateCurrencyDialog;
    private showCreateBankDialog;
    private showCreatePropertyDialog;
    private showCreateStockDialog;
    private showUpdateGrowthDialog;
    private showExchangeRateDialog;
    private showEditEconomyDialog;
    private showEditBankDialog;
    private showEditPropertyDialog;
    private showCreateBankerDialog;
    private removeBanker;
    private showUpdatePropertyValueDialog;
}
