/**
 * LoanManager - Manages loans, repayments, and interest
 * @module loan-manager
 */

import { EconomyManager } from './economy-manager.js';

export interface Loan {
  id: string;
  actorId: string;
  accountId?: string; // Optional: linked to bank account
  principal: number; // Original loan amount
  remainingBalance: number; // Current balance owed
  interestRate: number; // Annual interest rate
  currency: string;
  startDate: number;
  dueDate?: number; // Optional: loan term in days
  paymentSchedule: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lump';
  lastPayment: number;
  totalPaid: number;
  status: 'active' | 'paid' | 'defaulted';
  description: string;
}

export class LoanManager {
  private loans: Map<string, Loan> = new Map();
  private economyManager: EconomyManager;
  private storageKey: string = 'foundrybank';

  constructor(economyManager: EconomyManager) {
    this.economyManager = economyManager;
  }

  /**
   * Initialize loan manager
   */
  async initialize(): Promise<void> {
    await this.loadData();
  }

  /**
   * Create a new loan
   */
  createLoan(
    actorId: string,
    principal: number,
    currency: string,
    interestRate?: number,
    dueDate?: number,
    paymentSchedule: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lump' = 'monthly',
    description: string = ''
  ): Loan {
    const loanId = `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Use economy-based interest rate if not specified
    const rate = interestRate ?? this.economyManager.getLoanInterestRate();

    const loan: Loan = {
      id: loanId,
      actorId,
      principal,
      remainingBalance: principal,
      interestRate: rate,
      currency,
      startDate: Date.now(),
      dueDate,
      paymentSchedule,
      lastPayment: Date.now(),
      totalPaid: 0,
      status: 'active',
      description: description || `Loan of ${principal} ${currency}`
    };

    this.loans.set(loanId, loan);
    this.saveData();

    Hooks.call('foundrybank.loanCreated', loan);
    return loan;
  }

  /**
   * Get all loans for an actor
   */
  getActorLoans(actorId: string): Loan[] {
    return Array.from(this.loans.values()).filter(loan => loan.actorId === actorId);
  }

  /**
   * Get active loans for an actor
   */
  getActiveLoans(actorId: string): Loan[] {
    return this.getActorLoans(actorId).filter(loan => loan.status === 'active');
  }

  /**
   * Get loan by ID
   */
  getLoan(loanId: string): Loan | undefined {
    return this.loans.get(loanId);
  }

  /**
   * Make a loan payment
   */
  async makePayment(loanId: string, amount: number): Promise<{ paid: number; remaining: number; interestAccrued: number }> {
    const loan = this.loans.get(loanId);
    if (!loan) {
      throw new Error(`Loan ${loanId} not found`);
    }

    if (loan.status !== 'active') {
      throw new Error('Cannot make payment on inactive loan');
    }

    // Calculate interest accrued since last payment
    const daysSinceLastPayment = (Date.now() - loan.lastPayment) / (1000 * 60 * 60 * 24);
    const interestAccrued = this.calculateInterest(loan.remainingBalance, loan.interestRate, daysSinceLastPayment);
    
    // Apply interest first
    loan.remainingBalance += interestAccrued;

    // Apply payment
    const paymentAmount = Math.min(amount, loan.remainingBalance);
    loan.remainingBalance -= paymentAmount;
    loan.totalPaid += paymentAmount;
    loan.lastPayment = Date.now();

    // Check if loan is paid off
    if (loan.remainingBalance <= 0.01) { // Small threshold for floating point
      loan.remainingBalance = 0;
      loan.status = 'paid';
      Hooks.call('foundrybank.loanPaid', loan);
    }

    this.saveData();
    Hooks.call('foundrybank.loanPayment', loan, paymentAmount, interestAccrued);

    return {
      paid: paymentAmount,
      remaining: loan.remainingBalance,
      interestAccrued
    };
  }

  /**
   * Calculate interest for a loan
   */
  private calculateInterest(principal: number, rate: number, days: number): number {
    // Simple interest: principal * rate * (days / 365)
    return principal * rate * (days / 365);
  }

  /**
   * Calculate next payment amount based on schedule
   */
  calculateNextPayment(loanId: string): number {
    const loan = this.loans.get(loanId);
    if (!loan) return 0;

    const daysSinceLastPayment = (Date.now() - loan.lastPayment) / (1000 * 60 * 60 * 24);
    const interestAccrued = this.calculateInterest(loan.remainingBalance, loan.interestRate, daysSinceLastPayment);
    
    // For lump sum, return full balance + interest
    if (loan.paymentSchedule === 'lump') {
      return loan.remainingBalance + interestAccrued;
    }

    // For scheduled payments, calculate based on schedule
    const daysPerPeriod = this.getDaysPerPeriod(loan.paymentSchedule);
    const periodsSinceLastPayment = Math.floor(daysSinceLastPayment / daysPerPeriod);
    
    if (periodsSinceLastPayment === 0) return 0;

    // Calculate payment to cover interest + some principal
    const interestForPeriod = this.calculateInterest(loan.remainingBalance, loan.interestRate, daysPerPeriod);
    const principalPayment = loan.principal / (loan.dueDate ? (loan.dueDate / daysPerPeriod) : 12); // Amortize over term or 12 periods
    
    return interestForPeriod + principalPayment;
  }

  /**
   * Get days per payment period
   */
  private getDaysPerPeriod(schedule: string): number {
    switch (schedule) {
      case 'daily': return 1;
      case 'weekly': return 7;
      case 'monthly': return 30;
      case 'yearly': return 365;
      default: return 30;
    }
  }

  /**
   * Save loan data
   */
  private async saveData(): Promise<void> {
    const data = {
      loans: Array.from(this.loans.entries())
    };
    await game.settings.set(this.storageKey, 'loanData', data);
  }

  /**
   * Load loan data
   */
  private async loadData(): Promise<void> {
    const data = game.settings.get(this.storageKey, 'loanData') as any;
    if (data?.loans) {
      this.loans = new Map(data.loans);
    }
  }
}

