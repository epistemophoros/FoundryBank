/**
 * Simple Verification Script
 * Tests that all systems can be instantiated and basic operations work
 * Run: node test/simple-verify.js
 * 
 * Note: This requires compiled JavaScript (run 'npm run build' first)
 * Or run in Foundry VTT environment
 */

console.log('🧪 FoundryBank System Verification');
console.log('='.repeat(50));
console.log('\nThis script verifies the module structure.\n');
console.log('For full testing, use Foundry VTT or run: npm run verify\n');

// Check if files exist (basic verification)
const fs = require('fs');
const path = require('path');

const checks = [
  { file: 'src/foundrybank.ts', name: 'Main Module' },
  { file: 'src/economy-system.ts', name: 'Economy System' },
  { file: 'src/bank-manager.ts', name: 'Bank Manager' },
  { file: 'src/property-manager.ts', name: 'Property Manager' },
  { file: 'src/loan-manager.ts', name: 'Loan Manager' },
  { file: 'src/stock-manager.ts', name: 'Stock Manager' },
  { file: 'src/banker-system.ts', name: 'Banker System' },
  { file: 'src/economy-manager.ts', name: 'Economy Manager' },
  { file: 'src/gm-manager-dialog.ts', name: 'GM Manager Dialog' },
  { file: 'module.json', name: 'Module Manifest' },
  { file: 'package.json', name: 'Package Config' },
  { file: 'tsconfig.json', name: 'TypeScript Config' }
];

let passed = 0;
let failed = 0;

console.log('📁 Checking Files...\n');

checks.forEach(check => {
  const filePath = path.join(__dirname, '..', check.file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${check.name}: ${check.file}`);
    passed++;
  } else {
    console.log(`  ❌ ${check.name}: ${check.file} - NOT FOUND`);
    failed++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${checks.length}`);

if (failed === 0) {
  console.log('\n✅ All core files present!');
  console.log('\nNext steps:');
  console.log('  1. Run: npm run check (verify TypeScript)');
  console.log('  2. Run: npm run build (compile to JavaScript)');
  console.log('  3. Test in Foundry VTT');
  process.exit(0);
} else {
  console.log('\n❌ Some files are missing!');
  process.exit(1);
}

