#!/usr/bin/env node
/**
 * Register Safe Wallets in RevelNation System
 * Run after creating Safes at app.safe.global
 */

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SERVER_URL = 'http://137.184.183.142:3000';

const members = [
  { name: 'Deborah Sale', key: 'deborah' },
  { name: 'Gregory Ward', key: 'gregory' },
  { name: 'Peter Rivera', key: 'peter' },
  { name: 'Gary Krensel', key: 'gary' }
];

console.log('\n🔐 Register Safe Wallets in RevelNation System');
console.log('═══════════════════════════════════════════════\n');

let safeAddresses = {};

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function registerSafe(userId, safeAddress, name) {
  console.log(`\n📝 Registering ${name}...`);
  
  const curlCommand = `curl -X POST ${SERVER_URL}/wallet/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "${userId}",
    "safeAddress": "${safeAddress}",
    "name": "${name}"
  }'`;
  
  console.log('\nRun this command:');
  console.log(curlCommand);
  console.log('');
}

async function main() {
  console.log('This script will help you register Safe wallets in the system.\n');
  console.log('You need:');
  console.log('  1. Safe addresses (from app.safe.global)');
  console.log('  2. User IDs (from authentication)\n');
  
  const hasUserIds = await question('Do you have user IDs from authentication? (yes/no): ');
  
  if (hasUserIds.toLowerCase() !== 'yes') {
    console.log('\n⚠️  First, each team member needs to register via the authentication API:');
    console.log('\nFor each member, run:');
    console.log(`curl -X POST ${SERVER_URL}/auth/register/begin \\`);
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email": "member@revelnation.com", "name": "Member Name"}\'');
    console.log('\nThen complete the passkey registration flow.');
    console.log('After registration, you\'ll get user IDs.');
    console.log('\nRun this script again once you have user IDs.\n');
    rl.close();
    return;
  }
  
  console.log('\n');
  
  for (const member of members) {
    console.log(`\n${member.name}`);
    console.log('─'.repeat(40));
    
    const userId = await question(`  User ID: `);
    const safeAddress = await question(`  Safe Address: `);
    
    if (!userId || !safeAddress) {
      console.log('  ⚠️  Skipped (missing data)');
      continue;
    }
    
    safeAddresses[member.key] = {
      name: member.name,
      userId: userId,
      safeAddress: safeAddress
    };
    
    await registerSafe(userId, safeAddress, `${member.name} - Main Wallet`);
  }
  
  // Save configuration
  fs.writeFileSync('safe-addresses.json', JSON.stringify(safeAddresses, null, 2));
  console.log('\n✅ Configuration saved to safe-addresses.json');
  
  console.log('\n\n═══════════════════════════════════════════════');
  console.log('NEXT STEPS');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log('1. Start the USDT indexer:');
  console.log(`   curl ${SERVER_URL}/indexer/start\n`);
  
  console.log('2. Check balances:');
  for (const [key, data] of Object.entries(safeAddresses)) {
    console.log(`   curl ${SERVER_URL}/wallet/balance/${data.safeAddress}`);
  }
  
  console.log('\n3. Share Safe addresses with senders:');
  for (const [key, data] of Object.entries(safeAddresses)) {
    console.log(`   ${data.name}: ${data.safeAddress}`);
  }
  
  console.log('\n⚠️  IMPORTANT: Always specify "Ethereum Mainnet ERC-20 USDT"');
  console.log('   DO NOT use Tron (TRC-20) or other networks!\n');
  
  rl.close();
}

main().catch(console.error);
