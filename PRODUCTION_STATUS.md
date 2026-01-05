# 🚀 Production Deployment Status

**Date:** January 5, 2026  
**Server:** 137.184.183.142  
**Status:** ✅ **LIVE & OPERATIONAL**

---

## ✅ What's Working

### Backend Services
- **NestJS Server**: Running on port 3000
- **PostgreSQL Database**: Connected and migrated
- **Prisma ORM**: v7.2.0 with PostgreSQL adapter
- **PM2 Process Manager**: Auto-restart enabled, survives server reboots

### APIs Available
- `POST /auth/register/begin` - Start passkey registration
- `POST /auth/register/complete` - Complete passkey registration
- `POST /auth/login/begin` - Start passkey login
- `POST /auth/login/complete` - Complete passkey login
- `POST /wallet/*` - Wallet management endpoints
- `GET /indexer/*` - USDT deposit monitoring

### Infrastructure
- **Blockchain RPC**: Infura mainnet (Ethereum)
- **Network**: Ethereum mainnet (Chain ID: 1)
- **USDT Contract**: 0xdac17f958d2ee523a2206206994597c13d831ec7
- **Safe Transaction Service**: Connected to mainnet

---

## 📋 Configuration

### Environment Variables (Production)
```bash
DATABASE_URL=postgresql://revelnation_user:***@localhost:5432/revelnation
NODE_ENV=production
PORT=3000
APP_URL=http://137.184.183.142:3000
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/b77818cd4ab148878fd74d0bb304aa2c
ETHEREUM_CHAIN_ID=1
SAFE_TRANSACTION_SERVICE_URL=https://safe-transaction-mainnet.safe.global
USDT_CONTRACT_ADDRESS=0xdac17f958d2ee523a2206206994597c13d831ec7
RP_NAME=RevelNation Secure Wallet
RP_ID=137.184.183.142
RP_ORIGIN=http://137.184.183.142:3000
REQUIRED_CONFIRMATIONS=12
ADMIN_SIGNER_1=0x2708a5A21f88b37E6497aAc25185190f7a16924d
ADMIN_SIGNER_2=0xbaE5605171fA709c018D76011f93FcD617D0a09a
```

### Admin Wallets (SAVE THESE SECURELY)
```
Admin Wallet 1:
Address: 0x2708a5A21f88b37E6497aAc25185190f7a16924d
Private Key: 0x3e6cdd6e18803e8880ddb64ba40bdbcbafc5704e21f3461644d45dd0b5c0a484

Admin Wallet 2:
Address: 0xbaE5605171fA709c018D76011f93FcD617D0a09a
Private Key: 0x7b304cd41e7a28ac145330d7157006269e96dc2e6b0ec9f81cd3a9644688d039
```

---

## 🎯 Next Steps for Deborah

### Option 1: Create Deborah's Safe Wallet (Recommended - Week 1)

**Step 1: Create Safe via Web UI**
1. Go to https://app.safe.global
2. Connect with MetaMask or wallet
3. Create new Safe:
   - **Owners**: 
     - Deborah's wallet address (she needs to create one first)
     - Admin 1: 0x2708a5A21f88b37E6497aAc25185190f7a16924d
     - Admin 2: 0xbaE5605171fA709c018D76011f93FcD617D0a09a
   - **Threshold**: 2 of 3
4. Deploy Safe (costs ~$30-50 in gas)
5. Copy the Safe address

**Step 2: Register Safe in System**
```bash
curl -X POST http://137.184.183.142:3000/wallet/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_FROM_AUTH",
    "safeAddress": "0xSAFE_ADDRESS_FROM_STEP1",
    "name": "Deborah Main Wallet"
  }'
```

**Step 3: Start USDT Monitoring**
```bash
curl http://137.184.183.142:3000/indexer/start
```

**Step 4: Share Safe Address**
Send this to USDT senders:
- **Address**: [Safe address from Step 1]
- **Network**: Ethereum Mainnet
- **Token**: USDT (ERC-20) ONLY
- **WARNING**: Do NOT send TRC-20 (Tron) USDT

---

### Option 2: Simple Personal Wallet (Quick Start)

**For Testing Only** - Use the HTML wallet generator:
1. Open `eth-cdn-example.html` in browser
2. Generate new wallet
3. Save private key securely
4. Share address for receiving USDT

⚠️ **Not recommended for production/high-value transactions**

---

## 🔧 Server Management

### Check Server Status
```bash
ssh root@137.184.183.142
pm2 status commodex
```

### View Logs
```bash
pm2 logs commodex
pm2 logs commodex --lines 100
```

### Restart Server
```bash
pm2 restart commodex
```

### Update Code
```bash
cd /opt/commodex-server
git pull
npm install
npm run build
pm2 restart commodex
```

---

## 🔐 Security Notes

1. **Admin private keys** are saved in `/home/greg/dev/secure-usdt/generate-wallets.js` output
2. **Database password** is in production `.env` file
3. **No private keys stored on server** - all transactions require manual Safe signing
4. **Passkey authentication** prevents password phishing
5. **12-block confirmation** requirement for deposits (reorg-safe)

---

## 📊 Monitoring

### Check USDT Balance
```bash
curl http://137.184.183.142:3000/wallet/balance/SAFE_ADDRESS
```

### Check Recent Deposits
```bash
curl http://137.184.183.142:3000/indexer/deposits/SAFE_ADDRESS
```

---

## 🆘 Troubleshooting

### Server Won't Start
```bash
ssh root@137.184.183.142
pm2 delete commodex
cd /opt/commodex-server
npm run start:prod
# Watch for errors
```

### Database Issues
```bash
ssh root@137.184.183.142
sudo -u postgres psql -d revelnation
# Check tables: \dt
# Check connections: SELECT * FROM pg_stat_activity;
```

### Blockchain Connection Issues
- Verify Infura API key is valid
- Check mainnet status: https://etherscan.io
- Test RPC: `curl https://mainnet.infura.io/v3/b77818cd4ab148878fd74d0bb304aa2c -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`

---

## 📚 Documentation Links

- [README.md](./README.md) - Project overview
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Full deployment steps
- [WEEK1_CHECKLIST.md](./WEEK1_CHECKLIST.md) - Day-by-day tasks
- [overview.md](./overview.md) - Security architecture (original spec)

---

## ✅ Deployment Checklist

- [x] Code deployed to GitHub
- [x] Server provisioned (137.184.183.142)
- [x] PostgreSQL installed and configured
- [x] Database migrations executed
- [x] Environment variables configured
- [x] Server built and running
- [x] PM2 configured for auto-restart
- [x] Admin wallets generated
- [ ] Deborah's Safe wallet created
- [ ] Safe registered in system
- [ ] USDT indexer started
- [ ] Test deposit verified

---

**🎉 SERVER IS READY FOR DEBORAH TO START RECEIVING USDT THIS WEEK!**
