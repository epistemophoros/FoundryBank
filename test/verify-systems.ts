/**
 * System Verification Script
 * Run this to verify all systems work correctly without Foundry VTT
 * Usage: npm run verify
 */

// Mock Foundry VTT globals for testing
(global as any).game = {
  settings: {
    get: (module: string, key: string) => {
      const storage: any = {};
      return storage[key] || null;
    },
    set: async (module: string, key: string, value: any) => {
      const storage: any = {};
      storage[key] = value;
      return Promise.resolve();
    },
    register: (module: string, key: string, config: any) => {
      // Mock registration
    }
  },
  actors: {
    get: (id: string) => ({ id, name: 'Test Actor', system: {} }),
    owned: () => [],
    filter: () => []
  },
  user: { isGM: true, character: null },
  system: { id: 'dnd5e' },
  modules: {
    get: (id: string) => ({ active: true })
  },
  i18n: {
    localize: (key: string) => key,
    format: (key: string, data: any) => key
  },
  foundrybank: {}
};

(global as any).ui = {
  notifications: {
    info: (msg: string) => console.log('INFO:', msg),
    warn: (msg: string) => console.warn('WARN:', msg),
    error: (msg: string) => console.error('ERROR:', msg)
  }
};

(global as any).Hooks = {
  on: (name: string, callback: Function) => {},
  once: (name: string, callback: Function) => {},
  call: (name: string, ...args: any[]) => {}
};

(global as any).foundry = {
  utils: {
    mergeObject: (target: any, source: any) => ({ ...target, ...source }),
    Hooks: {}
  }
};

(global as any).Handlebars = {
  helpers: {},
  registerHelper: (name: string, fn: Function) => {}
};

(global as any).renderTemplate = async (path: string, data: any) => {
  return `<div>Mock template for ${path}</div>`;
};

(global as any).Dialog = class {
  constructor(config: any) {}
  render(flag: boolean) {}
};

(global as any).Application = class {
  constructor(config: any) {}
  render(flag: boolean) {}
  getData() { return {}; }
  activateListeners(html: any) {}
};

(global as any).console = console;
(global as any).window = { setInterval: setInterval, clearInterval: clearInterval };

// Note: This verification script requires the compiled JavaScript
// Run 'npm run build' first, then this will test the compiled code
// Or use dynamic imports to test TypeScript directly

// For now, we'll create a simple verification that checks structure
// Full system testing requires Foundry VTT environment

interface TestResult {
  system: string;
  test: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.then(() => {
        results.push({ system: 'General', test: name, passed: true });
      }).catch((error) => {
        results.push({ system: 'General', test: name, passed: false, error: error.message });
      });
    } else {
      results.push({ system: 'General', test: name, passed: true });
    }
  } catch (error: any) {
    results.push({ system: 'General', test: name, passed: false, error: error.message });
  }
}

async function runTests() {
  console.log('🧪 Starting FoundryBank System Verification...\n');

  // Test Economy System
  console.log('📊 Testing Economy System...');
  const economySystem = new EconomySystem();
  await economySystem.initialize();

  test('Create Economy', () => {
    const economy = economySystem.createEconomy('Test Kingdom', 'Test', 'kingdom', 0.1, 0.02);
    if (!economy || !economy.id) throw new Error('Economy not created');
    console.log('  ✅ Economy created:', economy.name);
  });

  test('Create Currency', async () => {
    const economy = economySystem.createEconomy('Test Economy', 'Test', 'kingdom');
    const currency = economySystem.createCurrency(economy.id, 'TC', 'Test Coin', 'Test Coins', 1.0, true);
    if (!currency || !currency.id) throw new Error('Currency not created');
    console.log('  ✅ Currency created:', currency.symbol);
  });

  test('Set Exchange Rate', async () => {
    const economy = economySystem.createEconomy('Test Economy', 'Test', 'kingdom');
    const curr1 = economySystem.createCurrency(economy.id, 'C1', 'Coin 1', 'Coins 1', 1.0, true);
    const curr2 = economySystem.createCurrency(economy.id, 'C2', 'Coin 2', 'Coins 2', 2.0);
    economySystem.setExchangeRate(curr1.id, curr2.id, 2.0);
    const rate = economySystem.getExchangeRate(curr1.id, curr2.id);
    if (rate !== 2.0) throw new Error(`Exchange rate incorrect: ${rate}`);
    console.log('  ✅ Exchange rate set correctly');
  });

  // Test Bank Manager
  console.log('\n🏦 Testing Bank Manager...');
  const bankManager = new BankManager();
  (bankManager as any).economySystem = economySystem;
  await bankManager.initialize();

  test('Create Bank', () => {
    const economy = economySystem.createEconomy('Test Economy', 'Test', 'kingdom');
    const bank = bankManager.createBank('Test Bank', economy.id, 'Test Bank Description');
    if (!bank || !bank.id) throw new Error('Bank not created');
    console.log('  ✅ Bank created:', bank.name);
  });

  test('Create Account', () => {
    const economy = economySystem.createEconomy('Test Economy', 'Test', 'kingdom');
    const currency = economySystem.createCurrency(economy.id, 'TC', 'Test Coin', 'Test Coins', 1.0, true);
    const bank = bankManager.createBank('Test Bank', economy.id);
    const account = bankManager.createAccount(bank.id, 'actor-1', 'Test Account', currency.id);
    if (!account || !account.id) throw new Error('Account not created');
    console.log('  ✅ Account created:', account.accountName);
  });

  test('Deposit', async () => {
    const economy = economySystem.createEconomy('Test Economy', 'Test', 'kingdom');
    const currency = economySystem.createCurrency(economy.id, 'TC', 'Test Coin', 'Test Coins', 1.0, true);
    const bank = bankManager.createBank('Test Bank', economy.id);
    const account = bankManager.createAccount(bank.id, 'actor-1', 'Test Account', currency.id);
    await bankManager.deposit(account.id, 100, 'Test deposit');
    const updated = bankManager.getAccount(account.id);
    if (updated?.balance !== 100) throw new Error(`Balance incorrect: ${updated?.balance}`);
    console.log('  ✅ Deposit works, balance:', updated?.balance);
  });

  test('Withdraw', async () => {
    const economy = economySystem.createEconomy('Test Economy', 'Test', 'kingdom');
    const currency = economySystem.createCurrency(economy.id, 'TC', 'Test Coin', 'Test Coins', 1.0, true);
    const bank = bankManager.createBank('Test Bank', economy.id);
    const account = bankManager.createAccount(bank.id, 'actor-1', 'Test Account', currency.id);
    await bankManager.deposit(account.id, 100);
    await bankManager.withdraw(account.id, 50);
    const updated = bankManager.getAccount(account.id);
    if (updated?.balance !== 50) throw new Error(`Balance incorrect: ${updated?.balance}`);
    console.log('  ✅ Withdraw works, balance:', updated?.balance);
  });

  // Test Property Manager
  console.log('\n🏠 Testing Property Manager...');
  const propertyManager = new PropertyManager();
  await propertyManager.initialize();

  test('Create Property', () => {
    const economy = economySystem.createEconomy('Test Economy', 'Test', 'kingdom');
    const currency = economySystem.createCurrency(economy.id, 'TC', 'Test Coin', 'Test Coins', 1.0, true);
    const bank = bankManager.createBank('Test Bank', economy.id);
    const property = propertyManager.createProperty(
      'Test Estate', 'Test', 'real_estate', economy.id, 1000, currency.id, bank.id
    );
    if (!property || !property.id) throw new Error('Property not created');
    console.log('  ✅ Property created:', property.name);
  });

  test('Purchase Property', async () => {
    const economy = economySystem.createEconomy('Test Economy', 'Test', 'kingdom');
    const currency = economySystem.createCurrency(economy.id, 'TC', 'Test Coin', 'Test Coins', 1.0, true);
    const bank = bankManager.createBank('Test Bank', economy.id);
    const account = bankManager.createAccount(bank.id, 'actor-1', 'Test Account', currency.id);
    await bankManager.deposit(account.id, 1000);
    const property = propertyManager.createProperty(
      'Test Estate', 'Test', 'real_estate', economy.id, 1000, currency.id, bank.id
    );
    await propertyManager.purchaseProperty(property.id, 'actor-1', account.id, 1000, bankManager);
    const updated = propertyManager.getProperty(property.id);
    if (updated?.ownerId !== 'actor-1') throw new Error('Property not owned');
    const accountUpdated = bankManager.getAccount(account.id);
    if (accountUpdated?.balance !== 0) throw new Error('Account not debited');
    console.log('  ✅ Property purchase works');
  });

  // Test Loan Manager
  console.log('\n💳 Testing Loan Manager...');
  const economyManager = new EconomyManager();
  await economyManager.initialize();
  const loanManager = new LoanManager(economyManager);
  await loanManager.initialize();

  test('Create Loan', () => {
    const loan = loanManager.createLoan('actor-1', 1000, 'gp', 0.05, 365, 'monthly', 'Test loan');
    if (!loan || !loan.id) throw new Error('Loan not created');
    console.log('  ✅ Loan created:', loan.id);
  });

  test('Make Loan Payment', async () => {
    const loan = loanManager.createLoan('actor-1', 1000, 'gp', 0.05, 365, 'monthly', 'Test loan');
    const result = await loanManager.makePayment(loan.id, 100);
    if (result.remaining >= 1000) throw new Error('Payment not applied');
    console.log('  ✅ Loan payment works, remaining:', result.remaining);
  });

  // Test Stock Manager
  console.log('\n📈 Testing Stock Manager...');
  const stockManager = new StockManager(economyManager);
  await stockManager.initialize();

  test('Create Stock', () => {
    const stock = stockManager.createStock('TEST', 'Test Company', 100, 'gp', 0.1);
    if (!stock || !stock.id) throw new Error('Stock not created');
    console.log('  ✅ Stock created:', stock.symbol);
  });

  test('Buy Stock', () => {
    const stock = stockManager.createStock('TEST', 'Test Company', 100, 'gp', 0.1);
    const holding = stockManager.buyStock('actor-1', stock.id, 10);
    if (!holding || !holding.id) throw new Error('Holding not created');
    console.log('  ✅ Stock purchase works, shares:', holding.shares);
  });

  // Test Banker System
  console.log('\n👔 Testing Banker System...');
  const bankerSystem = new BankerSystem();
  await bankerSystem.initialize();

  test('Register Banker', () => {
    const economy = economySystem.createEconomy('Test Economy', 'Test', 'kingdom');
    const bank = bankManager.createBank('Test Bank', economy.id);
    (global as any).game.actors.get = (id: string) => ({ id, name: 'Test Banker', system: {} });
    const banker = bankerSystem.registerBanker('banker-1', bank.id, 'Head Teller');
    if (!banker || banker.actorId !== 'banker-1') throw new Error('Banker not registered');
    console.log('  ✅ Banker registered:', banker.name);
  });

  // Print Results
  console.log('\n📋 Test Results Summary:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.system}: ${r.test}`);
      console.log(`    Error: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (failed === 0) {
    console.log('🎉 All systems verified successfully!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

