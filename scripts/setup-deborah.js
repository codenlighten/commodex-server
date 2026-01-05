#!/usr/bin/env node

/**
 * Quick setup script for Deborah's wallet
 * Run with: node scripts/setup-deborah.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n🔐 RevelNation Secure Wallet - Deborah Setup\n');
console.log('This script will guide you through setting up Deborah\'s secure USDT wallet.\n');

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('Step 1: Configuration Check');
  console.log('─'.repeat(50));
  
  const hasDb = await ask('Have you set up PostgreSQL? (y/n): ');
  if (hasDb.toLowerCase() !== 'y') {
    console.log('\n⚠️  Set up PostgreSQL first:');
    console.log('   1. Install PostgreSQL');
    console.log('   2. Create database: createdb revelnation');
    console.log('   3. Update DATABASE_URL in .env\n');
    process.exit(1);
  }

  const hasRpc = await ask('Do you have an Alchemy/Infura API key? (y/n): ');
  if (hasRpc.toLowerCase() !== 'y') {
    console.log('\n⚠️  Get an RPC provider:');
    console.log('   1. Sign up at https://www.alchemy.com');
    console.log('   2. Create an Ethereum app');
    console.log('   3. Copy API key to ETHEREUM_RPC_URL in .env\n');
    process.exit(1);
  }

  console.log('\n✅ Configuration looks good!\n');

  console.log('Step 2: Admin Signers');
  console.log('─'.repeat(50));
  const admin1 = await ask('Admin signer 1 address (0x...): ');
  const admin2 = await ask('Admin signer 2 address (0x...): ');

  console.log('\n📝 Add these to your .env file:');
  console.log(`ADMIN_SIGNER_1=${admin1}`);
  console.log(`ADMIN_SIGNER_2=${admin2}\n`);

  console.log('Step 3: Deployment Checklist');
  console.log('─'.repeat(50));
  console.log('Run these commands:\n');
  console.log('1. npm install');
  console.log('2. npm run prisma:generate');
  console.log('3. npm run prisma:migrate');
  console.log('4. npm run start:dev\n');

  console.log('Step 4: Create Deborah\'s Safe');
  console.log('─'.repeat(50));
  console.log('Manual process (Week 1):\n');
  console.log('1. Go to https://app.safe.global');
  console.log('2. Connect wallet (use admin1 or admin2)');
  console.log('3. Click "Create new Safe"');
  console.log('4. Add 3 owners:');
  console.log(`   - Deborah's passkey address (she'll create this when she registers)`);
  console.log(`   - ${admin1}`);
  console.log(`   - ${admin2}`);
  console.log('5. Set threshold to 2');
  console.log('6. Deploy Safe');
  console.log('7. Copy the Safe address\n');

  console.log('Step 5: Register Deborah');
  console.log('─'.repeat(50));
  console.log('Have Deborah:');
  console.log('1. Visit your app');
  console.log('2. Register with email: deborah@revelnation.com');
  console.log('3. Create passkey (fingerprint/face ID)');
  console.log('4. Note her passkey address (shown after registration)\n');

  console.log('Step 6: Register the Safe');
  console.log('─'.repeat(50));
  console.log('After Safe is deployed and Deborah is registered:');
  console.log('POST /wallet/register');
  console.log('{ "safeAddress": "0xTheSafeAddress" }\n');

  console.log('Step 7: Start Monitoring');
  console.log('─'.repeat(50));
  console.log('GET /indexer/start\n');

  console.log('✅ Setup complete!\n');
  console.log('Deborah can now share her Safe address to receive USDT.\n');
  console.log('⚠️  Remember: Only Ethereum mainnet ERC-20 USDT!\n');

  rl.close();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
