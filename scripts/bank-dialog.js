/**
 * BankDialog - Main banking interface dialog
 * @module bank-dialog
 */
export class BankDialog extends Application {
    constructor(actor, bankManager) {
        super({
            title: `${game.i18n.localize('FOUNDRYBANK.BankDialog')} - ${actor.name}`,
            template: 'modules/foundrybank/templates/bank-dialog.hbs',
            width: 600,
            height: 700,
            resizable: true
        });
        this.accounts = [];
        this.selectedAccountId = null;
        this.actor = actor;
        this.bankManager = bankManager;
        this.accounts = bankManager.getActorAccounts(actor.id);
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['foundrybank', 'bank-dialog'],
            width: 600,
            height: 700,
            resizable: true
        });
    }
    getData() {
        const selectedAccount = this.selectedAccountId
            ? this.bankManager.getAccount(this.selectedAccountId)
            : null;
        const transactions = selectedAccount
            ? this.bankManager.getAccountTransactions(selectedAccount.id, 20)
            : [];
        return {
            actor: this.actor,
            accounts: this.accounts,
            selectedAccount,
            transactions,
            currencies: ['gp', 'sp', 'cp', 'pp'],
            canManage: game.user?.isGM || this.actor.isOwner
        };
    }
    activateListeners(html) {
        super.activateListeners(html);
        // Account selection
        html.find('.account-item').on('click', (event) => {
            const accountId = $(event.currentTarget).data('account-id');
            this.selectAccount(accountId);
        });
        // Create new account
        html.find('.create-account-btn').on('click', () => {
            this.showCreateAccountDialog();
        });
        // Deposit button
        html.find('.deposit-btn').on('click', () => {
            if (this.selectedAccountId) {
                this.showDepositDialog();
            }
        });
        // Withdraw button
        html.find('.withdraw-btn').on('click', () => {
            if (this.selectedAccountId) {
                this.showWithdrawDialog();
            }
        });
        // Transfer button
        html.find('.transfer-btn').on('click', () => {
            if (this.selectedAccountId) {
                this.showTransferDialog();
            }
        });
        // Delete account button
        html.find('.delete-account-btn').on('click', () => {
            if (this.selectedAccountId) {
                this.deleteAccount();
            }
        });
        // Refresh button
        html.find('.refresh-btn').on('click', () => {
            this.refresh();
        });
    }
    selectAccount(accountId) {
        this.selectedAccountId = accountId;
        this.render();
    }
    async showCreateAccountDialog() {
        const content = await renderTemplate('modules/foundrybank/templates/create-account-dialog.hbs', {
            currencies: ['gp', 'sp', 'cp', 'pp']
        });
        new Dialog({
            title: game.i18n.localize('FOUNDRYBANK.CreateAccount'),
            content,
            buttons: {
                create: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize('FOUNDRYBANK.Create'),
                    callback: async (html) => {
                        const accountName = html.find('#account-name').val();
                        const currency = html.find('#account-currency').val();
                        if (!accountName || accountName.trim() === '') {
                            ui.notifications.error(game.i18n.localize('FOUNDRYBANK.AccountNameRequired'));
                            return;
                        }
                        try {
                            // Get bankId from existing account or first available bank
                            let bankId;
                            if (this.accounts.length > 0) {
                                bankId = this.accounts[0].bankId;
                            }
                            else {
                                const banks = this.bankManager.getAllBanks();
                                if (banks.length === 0) {
                                    ui.notifications.error('No banks available. Please create a bank first.');
                                    return;
                                }
                                bankId = banks[0].id;
                            }
                            if (!bankId) {
                                ui.notifications.error('Unable to determine bank for account creation.');
                                return;
                            }
                            const account = this.bankManager.createAccount(bankId, this.actor.id, accountName.trim(), currency);
                            this.accounts = this.bankManager.getActorAccounts(this.actor.id);
                            this.selectedAccountId = account.id;
                            this.render();
                            ui.notifications.info(game.i18n.localize('FOUNDRYBANK.AccountCreated'));
                        }
                        catch (error) {
                            ui.notifications.error(error.message);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize('FOUNDRYBANK.Cancel')
                }
            },
            default: 'create'
        }).render(true);
    }
    async showDepositDialog() {
        const account = this.bankManager.getAccount(this.selectedAccountId);
        if (!account)
            return;
        const content = await renderTemplate('modules/foundrybank/templates/transaction-dialog.hbs', {
            type: 'deposit',
            account,
            title: game.i18n.localize('FOUNDRYBANK.Deposit')
        });
        new Dialog({
            title: game.i18n.localize('FOUNDRYBANK.Deposit'),
            content,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize('FOUNDRYBANK.Confirm'),
                    callback: async (html) => {
                        const amount = parseFloat(html.find('#transaction-amount').val());
                        const description = html.find('#transaction-description').val();
                        if (isNaN(amount) || amount <= 0) {
                            ui.notifications.error(game.i18n.localize('FOUNDRYBANK.InvalidAmount'));
                            return;
                        }
                        try {
                            await this.bankManager.deposit(this.selectedAccountId, amount, description);
                            this.refresh();
                            ui.notifications.info(game.i18n.localize('FOUNDRYBANK.DepositSuccess'));
                        }
                        catch (error) {
                            ui.notifications.error(error.message);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize('FOUNDRYBANK.Cancel')
                }
            },
            default: 'confirm'
        }).render(true);
    }
    async showWithdrawDialog() {
        const account = this.bankManager.getAccount(this.selectedAccountId);
        if (!account)
            return;
        const content = await renderTemplate('modules/foundrybank/templates/transaction-dialog.hbs', {
            type: 'withdrawal',
            account,
            title: game.i18n.localize('FOUNDRYBANK.Withdraw')
        });
        new Dialog({
            title: game.i18n.localize('FOUNDRYBANK.Withdraw'),
            content,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize('FOUNDRYBANK.Confirm'),
                    callback: async (html) => {
                        const amount = parseFloat(html.find('#transaction-amount').val());
                        const description = html.find('#transaction-description').val();
                        if (isNaN(amount) || amount <= 0) {
                            ui.notifications.error(game.i18n.localize('FOUNDRYBANK.InvalidAmount'));
                            return;
                        }
                        try {
                            await this.bankManager.withdraw(this.selectedAccountId, amount, description);
                            this.refresh();
                            ui.notifications.info(game.i18n.localize('FOUNDRYBANK.WithdrawSuccess'));
                        }
                        catch (error) {
                            ui.notifications.error(error.message);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize('FOUNDRYBANK.Cancel')
                }
            },
            default: 'confirm'
        }).render(true);
    }
    async showTransferDialog() {
        const account = this.bankManager.getAccount(this.selectedAccountId);
        if (!account)
            return;
        const allAccounts = Array.from(this.bankManager.getActorAccounts(this.actor.id))
            .filter(acc => acc.id !== this.selectedAccountId);
        const content = await renderTemplate('modules/foundrybank/templates/transfer-dialog.hbs', {
            fromAccount: account,
            toAccounts: allAccounts
        });
        new Dialog({
            title: game.i18n.localize('FOUNDRYBANK.Transfer'),
            content,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize('FOUNDRYBANK.Confirm'),
                    callback: async (html) => {
                        const toAccountId = html.find('#to-account').val();
                        const amount = parseFloat(html.find('#transaction-amount').val());
                        const description = html.find('#transaction-description').val();
                        if (!toAccountId) {
                            ui.notifications.error(game.i18n.localize('FOUNDRYBANK.SelectTargetAccount'));
                            return;
                        }
                        if (isNaN(amount) || amount <= 0) {
                            ui.notifications.error(game.i18n.localize('FOUNDRYBANK.InvalidAmount'));
                            return;
                        }
                        try {
                            await this.bankManager.transfer(this.selectedAccountId, toAccountId, amount, description);
                            this.refresh();
                            ui.notifications.info(game.i18n.localize('FOUNDRYBANK.TransferSuccess'));
                        }
                        catch (error) {
                            ui.notifications.error(error.message);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize('FOUNDRYBANK.Cancel')
                }
            },
            default: 'confirm'
        }).render(true);
    }
    async deleteAccount() {
        const account = this.bankManager.getAccount(this.selectedAccountId);
        if (!account)
            return;
        if (account.balance !== 0) {
            ui.notifications.error(game.i18n.localize('FOUNDRYBANK.CannotDeleteNonZeroBalance'));
            return;
        }
        new Dialog({
            title: game.i18n.localize('FOUNDRYBANK.DeleteAccount'),
            content: `<p>${game.i18n.format('FOUNDRYBANK.ConfirmDeleteAccount', { name: account.accountName })}</p>`,
            buttons: {
                delete: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: game.i18n.localize('FOUNDRYBANK.Delete'),
                    callback: () => {
                        try {
                            this.bankManager.deleteAccount(this.selectedAccountId);
                            this.accounts = this.bankManager.getActorAccounts(this.actor.id);
                            this.selectedAccountId = null;
                            this.render();
                            ui.notifications.info(game.i18n.localize('FOUNDRYBANK.AccountDeleted'));
                        }
                        catch (error) {
                            ui.notifications.error(error.message);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize('FOUNDRYBANK.Cancel')
                }
            },
            default: 'cancel'
        }).render(true);
    }
    refresh() {
        this.accounts = this.bankManager.getActorAccounts(this.actor.id);
        this.render();
    }
}
