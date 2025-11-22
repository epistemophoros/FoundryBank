/**
 * BankDialog - Main banking interface dialog
 * @module bank-dialog
 */
import { BankManager } from './bank-manager.js';
export declare class BankDialog extends Application {
    private actor;
    private bankManager;
    private accounts;
    private selectedAccountId;
    constructor(actor: Actor, bankManager: BankManager);
    static get defaultOptions(): ApplicationOptions;
    getData(): any;
    activateListeners(html: JQuery): void;
    private selectAccount;
    private showCreateAccountDialog;
    private showDepositDialog;
    private showWithdrawDialog;
    private showTransferDialog;
    private deleteAccount;
    private refresh;
}
