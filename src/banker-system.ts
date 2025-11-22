/**
 * BankerSystem - Manages NPC bankers and bank interactions
 * @module banker-system
 */

export interface Banker {
  actorId: string;
  bankId: string;
  name: string;
  title?: string; // e.g., "Head Teller", "Loan Officer"
  description?: string;
  isActive: boolean;
}

export class BankerSystem {
  private bankers: Map<string, Banker> = new Map(); // Key: actorId
  private storageKey: string = 'foundrybank';

  /**
   * Initialize the BankerSystem
   */
  async initialize(): Promise<void> {
    await this.loadData();
    console.log(`FoundryBank | Loaded ${this.bankers.size} bankers`);
  }

  /**
   * Register an NPC as a banker for a specific bank
   */
  registerBanker(actorId: string, bankId: string, title?: string, description?: string): Banker {
    const actor = game.actors?.get(actorId);
    if (!actor) {
      throw new Error(`Actor ${actorId} not found`);
    }

    const banker: Banker = {
      actorId,
      bankId,
      name: actor.name,
      title,
      description,
      isActive: true
    };

    this.bankers.set(actorId, banker);
    this.saveData();

    // Set actor flag for easy checking
    actor.setFlag('foundrybank', 'isBanker', true);
    actor.setFlag('foundrybank', 'bankId', bankId);

    Hooks.call('foundrybank.bankerRegistered', banker);
    return banker;
  }

  /**
   * Unregister a banker
   */
  unregisterBanker(actorId: string): boolean {
    const banker = this.bankers.get(actorId);
    if (!banker) return false;

    this.bankers.delete(actorId);
    
    const actor = game.actors?.get(actorId);
    if (actor) {
      actor.unsetFlag('foundrybank', 'isBanker');
      actor.unsetFlag('foundrybank', 'bankId');
    }

    this.saveData();
    Hooks.call('foundrybank.bankerUnregistered', banker);
    return true;
  }

  /**
   * Get banker by actor ID
   */
  getBanker(actorId: string): Banker | undefined {
    return this.bankers.get(actorId);
  }

  /**
   * Check if an actor is a banker
   */
  isBanker(actorId: string): boolean {
    return this.bankers.has(actorId);
  }

  /**
   * Get all bankers
   */
  getAllBankers(): Banker[] {
    return Array.from(this.bankers.values());
  }

  /**
   * Get bankers for a specific bank
   */
  getBankBankers(bankId: string): Banker[] {
    return Array.from(this.bankers.values()).filter(b => b.bankId === bankId && b.isActive);
  }

  /**
   * Get bank ID for a banker actor
   */
  getBankerBankId(actorId: string): string | undefined {
    const banker = this.bankers.get(actorId);
    return banker?.bankId;
  }

  /**
   * Update banker details
   */
  updateBanker(actorId: string, updates: Partial<Banker>): void {
    const banker = this.bankers.get(actorId);
    if (!banker) {
      throw new Error(`Banker ${actorId} not found`);
    }

    Object.assign(banker, updates);
    this.saveData();
    Hooks.call('foundrybank.bankerUpdated', banker);
  }

  /**
   * Save data
   */
  private async saveData(): Promise<void> {
    const data = {
      bankers: Array.from(this.bankers.entries())
    };
    await game.settings.set(this.storageKey, 'bankerData', data);
  }

  /**
   * Load data
   */
  private async loadData(): Promise<void> {
    const data = game.settings.get(this.storageKey, 'bankerData') as any;
    
    if (data?.bankers) {
      this.bankers = new Map(data.bankers);
    }
  }
}

