/**
 * FoundryBank - A comprehensive banking system for Foundry VTT
 * @module foundrybank
 */
import { BankManager } from './bank-manager.js';
import { EconomyManager } from './economy-manager.js';
import { LoanManager } from './loan-manager.js';
import { StockManager } from './stock-manager.js';
import { EconomySystem } from './economy-system.js';
import { PropertyManager } from './property-manager.js';
import { BankerSystem } from './banker-system.js';
export declare class FoundryBank {
    private static bankManager;
    private static economySystem;
    private static economyManager;
    private static loanManager;
    private static stockManager;
    private static propertyManager;
    private static bankerSystem;
    private static initialized;
    /**
     * Initialize the FoundryBank module
     */
    static init(): Promise<void>;
    /**
     * Register all module hooks
     */
    private static registerHooks;
    /**
     * Register token control buttons
     */
    private static registerTokenControls;
    /**
     * Add GM Manager button to settings menu
     */
    private static addGMManagerButton;
    /**
     * Add GM Manager menu item to settings navigation
     */
    private static addGMManagerMenuItem;
    /**
     * Add bank button to token HUD
     */
    private static addTokenHUDButton;
    /**
     * Open bank dialog for a token
     */
    static openBankDialog(token: Token): void;
    /**
     * Open bank dialog from banker NPC
     */
    static openBankDialogFromBanker(token: Token): void;
    /**
     * Add banker button to token HUD
     */
    private static addBankerHUDButton;
    /**
     * Add banker button to actor sheet
     */
    private static addBankerSheetButton;
    /**
     * Open GM Manager Dialog
     */
    static openGMManagerDialog(): void;
    /**
     * Get the BankManager instance
     */
    static getBankManager(): BankManager;
    /**
     * Get the EconomyManager instance
     */
    static getEconomyManager(): EconomyManager;
    /**
     * Get the LoanManager instance
     */
    static getLoanManager(): LoanManager;
    /**
     * Get the StockManager instance
     */
    static getStockManager(): StockManager;
    /**
     * Get the EconomySystem instance
     */
    static getEconomySystem(): EconomySystem;
    /**
     * Get the PropertyManager instance
     */
    static getPropertyManager(): PropertyManager;
    /**
     * Get the BankerSystem instance
     */
    static getBankerSystem(): BankerSystem;
}
