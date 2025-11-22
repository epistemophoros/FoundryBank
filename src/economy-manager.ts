/**
 * EconomyManager - Manages economic growth, interest rates, and market conditions
 * @module economy-manager
 */

export interface EconomicState {
  growthRate: number; // -1.0 to 1.0 (recession to boom)
  baseInterestRate: number; // Base interest rate (0.0 to 1.0 = 0% to 100%)
  inflationRate: number; // Inflation rate (-0.5 to 0.5)
  lastUpdate: number;
}

export class EconomyManager {
  private economicState: EconomicState;
  private storageKey: string = 'foundrybank';

  constructor() {
    this.economicState = {
      growthRate: 0.0, // Neutral economy
      baseInterestRate: 0.02, // 2% base interest
      inflationRate: 0.0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Initialize economy manager
   */
  async initialize(): Promise<void> {
    await this.loadData();
    this.updateEconomicState();
  }

  /**
   * Get current economic state
   */
  getEconomicState(): EconomicState {
    return { ...this.economicState };
  }

  /**
   * Get current interest rate (affected by economic growth)
   */
  getInterestRate(): number {
    // Interest rate increases with economic growth
    // Base rate + (growth rate * multiplier)
    const growthMultiplier = 0.01; // 1% interest per 100% growth
    return Math.max(0, this.economicState.baseInterestRate + (this.economicState.growthRate * growthMultiplier));
  }

  /**
   * Get loan interest rate (higher than deposit rate)
   */
  getLoanInterestRate(): number {
    // Loan rates are typically 2-3x deposit rates
    return this.getInterestRate() * 2.5;
  }

  /**
   * Update economic growth (can be called periodically or by GM)
   */
  updateEconomicGrowth(growthRate: number): void {
    // Clamp growth rate between -1.0 and 1.0
    this.economicState.growthRate = Math.max(-1.0, Math.min(1.0, growthRate));
    this.economicState.lastUpdate = Date.now();
    this.saveData();
    
    Hooks.call('foundrybank.economyUpdate', this.economicState);
  }

  /**
   * Set base interest rate
   */
  setBaseInterestRate(rate: number): void {
    this.economicState.baseInterestRate = Math.max(0, Math.min(1.0, rate));
    this.economicState.lastUpdate = Date.now();
    this.saveData();
  }

  /**
   * Calculate interest for a deposit over time
   */
  calculateInterest(principal: number, days: number): number {
    const interestRate = this.getInterestRate();
    // Simple interest calculation: principal * rate * (days / 365)
    return principal * interestRate * (days / 365);
  }

  /**
   * Update economic state (can simulate gradual changes)
   */
  private updateEconomicState(): void {
    // This can be called periodically to simulate economic changes
    // For now, it just ensures the state is current
  }

  /**
   * Save economic data
   */
  private async saveData(): Promise<void> {
    await game.settings.set(this.storageKey, 'economicState', this.economicState);
  }

  /**
   * Load economic data
   */
  private async loadData(): Promise<void> {
    const data = game.settings.get(this.storageKey, 'economicState') as EconomicState;
    if (data) {
      this.economicState = data;
    }
  }
}

