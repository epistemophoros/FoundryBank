/**
 * LoanManager - Manages loans, repayments, and interest
 * @module loan-manager
 */
export class LoanManager {
    constructor(economyManager) {
        this.loans = new Map();
        this.storageKey = 'foundrybank';
        this.economyManager = economyManager;
    }
    /**
     * Initialize loan manager
     */
    async initialize() {
        await this.loadData();
    }
    /**
     * Create a new loan
     */
    createLoan(actorId, principal, currency, interestRate, dueDate, paymentSchedule = 'monthly', description = '') {
        const loanId = `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Use economy-based interest rate if not specified
        const rate = interestRate ?? this.economyManager.getLoanInterestRate();
        const loan = {
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
    getActorLoans(actorId) {
        return Array.from(this.loans.values()).filter(loan => loan.actorId === actorId);
    }
    /**
     * Get active loans for an actor
     */
    getActiveLoans(actorId) {
        return this.getActorLoans(actorId).filter(loan => loan.status === 'active');
    }
    /**
     * Get loan by ID
     */
    getLoan(loanId) {
        return this.loans.get(loanId);
    }
    /**
     * Make a loan payment
     */
    async makePayment(loanId, amount) {
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
    calculateInterest(principal, rate, days) {
        // Simple interest: principal * rate * (days / 365)
        return principal * rate * (days / 365);
    }
    /**
     * Calculate next payment amount based on schedule
     */
    calculateNextPayment(loanId) {
        const loan = this.loans.get(loanId);
        if (!loan)
            return 0;
        const daysSinceLastPayment = (Date.now() - loan.lastPayment) / (1000 * 60 * 60 * 24);
        const interestAccrued = this.calculateInterest(loan.remainingBalance, loan.interestRate, daysSinceLastPayment);
        // For lump sum, return full balance + interest
        if (loan.paymentSchedule === 'lump') {
            return loan.remainingBalance + interestAccrued;
        }
        // For scheduled payments, calculate based on schedule
        const daysPerPeriod = this.getDaysPerPeriod(loan.paymentSchedule);
        const periodsSinceLastPayment = Math.floor(daysSinceLastPayment / daysPerPeriod);
        if (periodsSinceLastPayment === 0)
            return 0;
        // Calculate payment to cover interest + some principal
        const interestForPeriod = this.calculateInterest(loan.remainingBalance, loan.interestRate, daysPerPeriod);
        const principalPayment = loan.principal / (loan.dueDate ? (loan.dueDate / daysPerPeriod) : 12); // Amortize over term or 12 periods
        return interestForPeriod + principalPayment;
    }
    /**
     * Get days per payment period
     */
    getDaysPerPeriod(schedule) {
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
    async saveData() {
        const data = {
            loans: Array.from(this.loans.entries())
        };
        await game.settings.set(this.storageKey, 'loanData', data);
    }
    /**
     * Load loan data
     */
    async loadData() {
        const data = game.settings.get(this.storageKey, 'loanData');
        if (data?.loans) {
            this.loans = new Map(data.loans);
        }
    }
}
