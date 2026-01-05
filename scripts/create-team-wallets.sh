#!/bin/bash
# Safe Wallet Creation Helper for RevelNation Team
# Creates Safe wallets for team members

set -e

echo "🔐 RevelNation Safe Wallet Setup"
echo "================================"
echo ""

# Admin addresses (already generated)
ADMIN1="0x2708a5A21f88b37E6497aAc25185190f7a16924d"
ADMIN2="0xbaE5605171fA709c018D76011f93FcD617D0a09a"

# Team members
declare -A MEMBERS=(
    ["deborah"]="Deborah Sale"
    ["gregory"]="Gregory Ward"
    ["peter"]="Peter Rivera"
    ["gary"]="Gary Krensel"
)

echo "Team Members:"
for key in "${!MEMBERS[@]}"; do
    echo "  - ${MEMBERS[$key]}"
done
echo ""

# Generate temporary wallet for each member
echo "📝 Generating temporary wallet addresses for each member..."
echo ""

node << 'ENDNODE'
const { ethers } = require('ethers');

const members = {
    'deborah': 'Deborah Sale',
    'gregory': 'Gregory Ward',
    'peter': 'Peter Rivera',
    'gary': 'Gary Krensel'
};

const wallets = {};

console.log('═══════════════════════════════════════════════════════════');
console.log('TEMPORARY MEMBER WALLETS (for Safe owners)');
console.log('═══════════════════════════════════════════════════════════\n');

for (const [key, name] of Object.entries(members)) {
    const wallet = ethers.Wallet.createRandom();
    wallets[key] = {
        name: name,
        address: wallet.address,
        privateKey: wallet.privateKey
    };
    
    console.log(`${name}:`);
    console.log(`  Address:     ${wallet.address}`);
    console.log(`  Private Key: ${wallet.privateKey}`);
    console.log('');
}

// Save to file
const fs = require('fs');
fs.writeFileSync('member-wallets.json', JSON.stringify(wallets, null, 2));
console.log('✅ Saved to member-wallets.json\n');

ENDNODE

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "SAFE CREATION INSTRUCTIONS"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "For each team member, create a Safe at https://app.safe.global"
echo ""
echo "Configuration for ALL Safes:"
echo "  Threshold: 2 of 3"
echo ""
echo "  Owner 1 (Admin): $ADMIN1"
echo "  Owner 2 (Admin): $ADMIN2"
echo "  Owner 3 (Member): [Use address from member-wallets.json]"
echo ""
echo "Example for Deborah Sale:"
echo "  1. Go to https://app.safe.global"
echo "  2. Connect wallet (use Admin 1 or Admin 2)"
echo "  3. Click 'Create New Safe'"
echo "  4. Select 'Ethereum Mainnet'"
echo "  5. Add 3 owners:"
echo "     - $ADMIN1"
echo "     - $ADMIN2"
echo "     - [Deborah's address from member-wallets.json]"
echo "  6. Set threshold to 2"
echo "  7. Deploy (costs ~\$30-50 in gas)"
echo "  8. Copy the Safe address"
echo "  9. Save it to safe-addresses.txt"
echo ""
echo "Repeat for Gregory, Peter, and Gary."
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "⚠️  CRITICAL: Save member-wallets.json securely!"
echo "    Team members will need their private keys to approve transactions."
echo ""
