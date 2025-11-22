/**
 * BankDialog - Main banking interface dialog
 * @module bank-dialog
 */

import { BankManager, BankAccount, Transaction } from './bank-manager.js';

export class BankDialog extends Application {
  private actor: Actor;
  private bankManager: BankManager;
  private accounts: BankAccount[] = [];
  private selectedAccountId: string | null = null;

  constructor(actor: Actor, bankManager: BankManager) {
    super({
      title: `${game.i18n.localize('FOUNDRYBANK.BankDialog')} - ${actor.name}`,
      template: 'modules/foundrybank/templates/bank-dialog.hbs',
      width: 600,
      height: 700,
      resizable: true
    });

    this.actor = actor;
    this.bankManager = bankManager;
    this.accounts = bankManager.getActorAccounts(actor.id);
  }

  static get defaultOptions(): ApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['foundrybank', 'bank-dialog'],
      width: 600,
      height: 700,
      resizable: true
    });
  }

  getData(): any {
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


  activateListeners(html: JQuery): void {
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

  private selectAccount(accountId: string): void {
    this.selectedAccountId = accountId;
    this.render();
  }

  private async showCreateAccountDialog(): Promise<void> {
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
          callback: async (html: JQuery) => {
            const accountName = html.find('#account-name').val() as string;
            const currency = html.find('#account-currency').val() as string;

            if (!accountName || accountName.trim() === '') {
              ui.notifications.error(game.i18n.localize('FOUNDRYBANK.AccountNameRequired'));
              return;
            }

            try {
              // Get bankId from existing account or first available bank
              let bankId: string | undefined;
              if (this.accounts.length > 0) {
                bankId = this.accounts[0].bankId;
              } else {
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

              const account = this.bankManager.createAccount(
                bankId,
                this.actor.id,
                accountName.trim(),
                currency
              );
              this.accounts = this.bankManager.getActorAccounts(this.actor.id);
              this.selectedAccountId = account.id;
              this.render();
              ui.notifications.info(game.i18n.localize('FOUNDRYBANK.AccountCreated'));
            } catch (error: any) {
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

  private async showDepositDialog(): Promise<void> {
    const account = this.bankManager.getAccount(this.selectedAccountId!);
    if (!account) return;

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
          callback: async (html: JQuery) => {
            const amount = parseFloat(html.find('#transaction-amount').val() as string);
            const description = html.find('#transaction-description').val() as string;

            if (isNaN(amount) || amount <= 0) {
              ui.notifications.error(game.i18n.localize('FOUNDRYBANK.InvalidAmount'));
              return;
            }

            try {
              await this.bankManager.deposit(this.selectedAccountId!, amount, description);
              this.refresh();
              ui.notifications.info(game.i18n.localize('FOUNDRYBANK.DepositSuccess'));
            } catch (error: any) {
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

  private async showWithdrawDialog(): Promise<void> {
    const account = this.bankManager.getAccount(this.selectedAccountId!);
    if (!account) return;

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
          callback: async (html: JQuery) => {
            const amount = parseFloat(html.find('#transaction-amount').val() as string);
            const description = html.find('#transaction-description').val() as string;

            if (isNaN(amount) || amount <= 0) {
              ui.notifications.error(game.i18n.localize('FOUNDRYBANK.InvalidAmount'));
              return;
            }

            try {
              await this.bankManager.withdraw(this.selectedAccountId!, amount, description);
              this.refresh();
              ui.notifications.info(game.i18n.localize('FOUNDRYBANK.WithdrawSuccess'));
            } catch (error: any) {
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

  private async showTransferDialog(): Promise<void> {
    const account = this.bankManager.getAccount(this.selectedAccountId!);
    if (!account) return;

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
          callback: async (html: JQuery) => {
            const toAccountId = html.find('#to-account').val() as string;
            const amount = parseFloat(html.find('#transaction-amount').val() as string);
            const description = html.find('#transaction-description').val() as string;

            if (!toAccountId) {
              ui.notifications.error(game.i18n.localize('FOUNDRYBANK.SelectTargetAccount'));
              return;
            }

            if (isNaN(amount) || amount <= 0) {
              ui.notifications.error(game.i18n.localize('FOUNDRYBANK.InvalidAmount'));
              return;
            }

            try {
              await this.bankManager.transfer(this.selectedAccountId!, toAccountId, amount, description);
              this.refresh();
              ui.notifications.info(game.i18n.localize('FOUNDRYBANK.TransferSuccess'));
            } catch (error: any) {
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

  private async deleteAccount(): Promise<void> {
    const account = this.bankManager.getAccount(this.selectedAccountId!);
    if (!account) return;

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
              this.bankManager.deleteAccount(this.selectedAccountId!);
              this.accounts = this.bankManager.getActorAccounts(this.actor.id);
              this.selectedAccountId = null;
              this.render();
              ui.notifications.info(game.i18n.localize('FOUNDRYBANK.AccountDeleted'));
            } catch (error: any) {
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

  private refresh(): void {
    this.accounts = this.bankManager.getActorAccounts(this.actor.id);
    this.render();
  }
}

