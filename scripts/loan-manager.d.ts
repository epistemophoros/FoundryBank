/**
 * LoanManager - Manages loans, repayments, and interest
 * @module loan-manager
 */
import { EconomyManager } from './economy-manager.js';
export interface Loan {
    id: string;
    actorId: string;
    accountId?: string;
    principal: number;
    remainingBalance: number;
    interestRate: number;
    currency: string;
    startDate: number;
    dueDate?: number;
    paymentSchedule: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lump';
    lastPayment: number;
    totalPaid: number;
    status: 'active' | 'paid' | 'defaulted';
    description: string;
}
export declare class LoanManager {
    private loans;
    private economyManager;
    private storageKey;
    constructor(economyManager: EconomyManager);
    /**
     * Initialize loan manager
     */
    initialize(): Promise<void>;
    /**
     * Create a new loan
     */
    createLoan(actorId: string, principal: number, currency: string, interestRate?: number, dueDate?: number, paymentSchedule?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lump', description?: string): Loan;
    /**
     * Get all loans for an actor
     */
    getActorLoans(actorId: string): Loan[];
    /**
     * Get active loans for an actor
     */
    getActiveLoans(actorId: string): Loan[];
    /**
     * Get loan by ID
     */
    getLoan(loanId: string): Loan | undefined;
    /**
     * Make a loan payment
     */
    makePayment(loanId: string, amount: number): Promise<{
        paid: number;
        remaining: number;
        interestAccrued: number;
    }>;
    /**
     * Calculate interest for a loan
     */
    private calculateInterest;
    /**
     * Calculate next payment amount based on schedule
     */
    calculateNextPayment(loanId: string): number;
    /**
     * Get days per payment period
     */
    private getDaysPerPeriod;
    /**
     * Save loan data
     */
    private saveData;
    /**
     * Load loan data
     */
    private loadData;
}
