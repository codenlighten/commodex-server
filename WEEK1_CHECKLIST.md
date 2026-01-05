# ✅ WEEK 1 CHECKLIST - Get Deborah Receiving USDT

## Day 1: Setup Infrastructure ⏱️ 1-2 hours

- [ ] Install PostgreSQL
  ```bash
  # Mac
  brew install postgresql
  brew services start postgresql
  createdb revelnation
  
  # Linux
  sudo apt install postgresql
  sudo systemctl start postgresql
  sudo -u postgres createdb revelnation
  ```

- [ ] Get Alchemy API Key
  - Go to https://dashboard.alchemy.com
  - Sign up / Log in
  - Create new app (Ethereum Mainnet or Sepolia for testing)
  - Copy HTTP URL

- [ ] Configure .env
  ```bash
  cp .env.example .env
  # Edit .env with your values
  ```
  
  Required:
  - DATABASE_URL=postgresql://...
  - ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
  - JWT_SECRET=(random 32+ chars)
  - ADMIN_SIGNER_1=0x...
  - ADMIN_SIGNER_2=0x...

- [ ] Install dependencies & generate Prisma
  ```bash
  npm install
  npm run prisma:generate
  npm run prisma:migrate
  ```

- [ ] Test server starts
  ```bash
  npm run start:dev
  ```
  Should see: "🚀 RevelNation Secure Wallet API running..."

---

## Day 2: Create Deborah's Safe ⏱️ 1 hour

- [ ] Get admin wallet addresses
  - Open MetaMask (or your wallet)
  - Copy your address → ADMIN_SIGNER_1
  - Get second trusted person's address → ADMIN_SIGNER_2

- [ ] Have Deborah register in app
  - POST /auth/register/begin
  - Email: deborah.sale@revelnation.com
  - Name: Deborah Sale
  - Complete passkey registration
  - **Save her passkey address!**

- [ ] Create Safe at https://app.safe.global
  - Connect wallet (use admin wallet)
  - "Create new Safe"
  - Network: Ethereum Mainnet (or Sepolia for testing)
  - Add 3 owners:
    - Deborah's passkey address
    - ADMIN_SIGNER_1
    - ADMIN_SIGNER_2
  - Set threshold: 2
  - Click "Deploy"
  - **Copy the Safe address!**

- [ ] Fund Safe with ETH for gas
  - Send ~$50-100 of ETH to Safe address
  - Needed for future USDT transfers out

- [ ] Register Safe in system
  ```bash
  curl -X POST http://localhost:3000/wallet/register \
    -H "Authorization: Bearer DEBORAHS_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"safeAddress": "0xTHE_SAFE_ADDRESS"}'
  ```

---

## Day 3: Start Monitoring ⏱️ 15 minutes

- [ ] Start USDT indexer
  ```bash
  curl http://localhost:3000/indexer/start
  ```
  Should see: "Monitoring started"

- [ ] Verify monitoring
  ```bash
  curl http://localhost:3000/indexer/status
  ```
  Should see: "isRunning: true"

- [ ] Test with small deposit (OPTIONAL - if you have testnet USDT)
  - Send 1 USDT to Safe address
  - Watch console logs for detection
  - Check ledger entries in Prisma Studio

---

## Day 4: Document & Share ⏱️ 30 minutes

- [ ] Create receiving instructions for Deborah
  ```
  DEBORAH'S USDT RECEIVING ADDRESS
  
  Send USDT (ERC-20) on Ethereum to:
  0x[HER_SAFE_ADDRESS]
  
  ⚠️ CRITICAL INSTRUCTIONS:
  - ONLY Ethereum mainnet ERC-20 USDT
  - DO NOT send TRC-20 (Tron)
  - DO NOT send BSC or other chains
  - Test with small amount first if possible
  
  Funds appear within:
  - 15 seconds: Initial detection
  - 2-3 minutes: Fully confirmed (12 blocks)
  ```

- [ ] Share Safe address with counterparties
  - Email/WhatsApp/Signal
  - Include QR code (generate at https://quickchart.io)
  - Emphasize "Ethereum ERC-20 ONLY"

- [ ] Set up monitoring alerts (OPTIONAL)
  - Large deposit alert (>$10k)
  - Daily balance report
  - Failed confirmation alert

---

## Day 5: Test & Verify ⏱️ 1 hour

- [ ] Verify Deborah can log in
  - POST /auth/login/begin
  - Complete passkey authentication
  - Receives JWT token

- [ ] Verify wallet shows correctly
  - GET /wallet/my-wallets
  - Shows Safe address
  - Shows balance (should be 0 initially)

- [ ] Verify indexer is running
  - Check server logs
  - Should see "Monitoring X wallet(s)"

- [ ] Document payout process
  - Write down who are the 2 required approvers
  - Save Safe app link for approvers
  - Test creating payout request (don't execute)

---

## Production Checklist (Before Real Money)

- [ ] **Switch to Mainnet**
  - Update ETHEREUM_RPC_URL to mainnet
  - Update SAFE_TRANSACTION_SERVICE_URL to mainnet
  - Update ETHEREUM_CHAIN_ID to 1
  - Restart server

- [ ] **Security Review**
  - [ ] No private keys in .env ✅
  - [ ] JWT_SECRET is strong random string
  - [ ] Database password is strong
  - [ ] .gitignore includes .env ✅
  - [ ] Admin signers are secure (hardware wallets?)

- [ ] **Database Backups**
  - Set up automated backups (daily minimum)
  - Test restore procedure
  - Store backups securely off-site

- [ ] **Monitoring**
  - Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
  - Set up error alerts (Sentry, LogRocket, etc.)
  - Monitor Safe balance daily

- [ ] **Documentation**
  - [ ] Share Safe address with Deborah
  - [ ] Give approvers access to Safe app
  - [ ] Document emergency procedures
  - [ ] Save recovery contacts

---

## Emergency Procedures

### If Server Goes Down
- Funds are SAFE in multisig
- Can still receive USDT (it's just an address)
- Can manually check balance at etherscan.io
- Can manually create payouts via Safe app

### If Deborah Loses Device
- Passkey is device-specific but Safe is protected
- 2 admins can still approve payouts
- Can add new passkey signer via Safe app
- Funds remain secure with 2-of-3

### If Need to Pause Everything
```bash
# Stop indexer
curl -X POST http://localhost:3000/indexer/stop

# Freeze payouts (set in Safe app)
# Go to Safe settings → Pause/Freeze
```

---

## Success Criteria ✅

You're ready when:

- [ ] Server starts without errors
- [ ] Deborah can log in with passkey
- [ ] Safe is created and registered
- [ ] Indexer shows "Monitoring X wallets"
- [ ] Safe address is shared with counterparties
- [ ] Backup plan documented
- [ ] 2 admins have Safe app access

---

## Quick Reference

### Important Links
- Safe App: https://app.safe.global
- Etherscan: https://etherscan.io/address/[SAFE_ADDRESS]
- Alchemy Dashboard: https://dashboard.alchemy.com
- Prisma Studio: http://localhost:5555

### Quick Commands
```bash
# Start server
npm run start:dev

# Start indexer
curl http://localhost:3000/indexer/start

# Check status
curl http://localhost:3000/indexer/status

# View database
npm run prisma:studio

# Check Safe balance
curl http://localhost:3000/wallet/my-wallets \
  -H "Authorization: Bearer TOKEN"
```

---

## 🎉 DONE!

Deborah can now securely receive USDT for high-value commodity deals!

**Next:** Build the frontend dashboard so she has a nice UI to see everything.
