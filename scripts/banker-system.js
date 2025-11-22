/**
 * BankerSystem - Manages NPC bankers and bank interactions
 * @module banker-system
 */
export class BankerSystem {
    constructor() {
        this.bankers = new Map(); // Key: actorId
        this.storageKey = 'foundrybank';
    }
    /**
     * Initialize the BankerSystem
     */
    async initialize() {
        await this.loadData();
        console.log(`FoundryBank | Loaded ${this.bankers.size} bankers`);
    }
    /**
     * Register an NPC as a banker for a specific bank
     */
    registerBanker(actorId, bankId, title, description) {
        const actor = game.actors?.get(actorId);
        if (!actor) {
            throw new Error(`Actor ${actorId} not found`);
        }
        const banker = {
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
    unregisterBanker(actorId) {
        const banker = this.bankers.get(actorId);
        if (!banker)
            return false;
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
    getBanker(actorId) {
        return this.bankers.get(actorId);
    }
    /**
     * Check if an actor is a banker
     */
    isBanker(actorId) {
        return this.bankers.has(actorId);
    }
    /**
     * Get all bankers
     */
    getAllBankers() {
        return Array.from(this.bankers.values());
    }
    /**
     * Get bankers for a specific bank
     */
    getBankBankers(bankId) {
        return Array.from(this.bankers.values()).filter(b => b.bankId === bankId && b.isActive);
    }
    /**
     * Get bank ID for a banker actor
     */
    getBankerBankId(actorId) {
        const banker = this.bankers.get(actorId);
        return banker?.bankId;
    }
    /**
     * Update banker details
     */
    updateBanker(actorId, updates) {
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
    async saveData() {
        const data = {
            bankers: Array.from(this.bankers.entries())
        };
        await game.settings.set(this.storageKey, 'bankerData', data);
    }
    /**
     * Load data
     */
    async loadData() {
        const data = game.settings.get(this.storageKey, 'bankerData');
        if (data?.bankers) {
            this.bankers = new Map(data.bankers);
        }
    }
}
