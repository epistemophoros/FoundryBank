/**
 * BankerSystem - Manages NPC bankers and bank interactions
 * @module banker-system
 */
export interface Banker {
    actorId: string;
    bankId: string;
    name: string;
    title?: string;
    description?: string;
    isActive: boolean;
}
export declare class BankerSystem {
    private bankers;
    private storageKey;
    /**
     * Initialize the BankerSystem
     */
    initialize(): Promise<void>;
    /**
     * Register an NPC as a banker for a specific bank
     */
    registerBanker(actorId: string, bankId: string, title?: string, description?: string): Banker;
    /**
     * Unregister a banker
     */
    unregisterBanker(actorId: string): boolean;
    /**
     * Get banker by actor ID
     */
    getBanker(actorId: string): Banker | undefined;
    /**
     * Check if an actor is a banker
     */
    isBanker(actorId: string): boolean;
    /**
     * Get all bankers
     */
    getAllBankers(): Banker[];
    /**
     * Get bankers for a specific bank
     */
    getBankBankers(bankId: string): Banker[];
    /**
     * Get bank ID for a banker actor
     */
    getBankerBankId(actorId: string): string | undefined;
    /**
     * Update banker details
     */
    updateBanker(actorId: string, updates: Partial<Banker>): void;
    /**
     * Save data
     */
    private saveData;
    /**
     * Load data
     */
    private loadData;
}
