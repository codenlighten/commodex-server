# 👥 Team Member Wallets - RevelNation

**Generated:** January 5, 2026  
**Purpose:** Safe multisig wallet owners for USDT commodity trading

---

## 🔐 Member Wallet Addresses (Safe Owners)

### Deborah Sale
- **Address:** `0x56f14787DCE5E9227004269ba126548911aaAc07`
- **Private Key:** `0xc67dbd338c61e5fdd97fabab32a91717312543782c9b1a2f8c7b237d5e0a094a`
- **Safe:** *[To be created at app.safe.global]*

### Gregory Ward
- **Address:** `0xf49963d00BD90D05eD53b8a8a73b84be6a71dacA`
- **Private Key:** `0xf45bdf554dfd3d6e997ff5d7fcc74667d36c93d37f8f0102383706c577146cbf`
- **Safe:** *[To be created at app.safe.global]*

### Peter Rivera
- **Address:** `0x8b677dcD43e1d56c78044cf86dc77476DC6A1818`
- **Private Key:** `0x8928034d00e33b265bf9c8e2d7dddac0314b389dbd88b09b98cbf6b83b8e754c`
- **Safe:** *[To be created at app.safe.global]*

### Gary Krensel
- **Address:** `0x4A1B18bbA4E9102F2Be45C76E40ca81f447FB8f6`
- **Private Key:** `0x7d9884751c53dc2be31a0e3d5c4472cf0e48a4dcf5b5df68dee4f661580cc73b`
- **Safe:** *[To be created at app.safe.global]*

---

## 🛡️ Admin Addresses (Already Generated)

### Admin 1
- **Address:** `0x2708a5A21f88b37E6497aAc25185190f7a16924d`
- **Private Key:** `0x3e6cdd6e18803e8880ddb64ba40bdbcbafc5704e21f3461644d45dd0b5c0a484`

### Admin 2
- **Address:** `0xbaE5605171fA709c018D76011f93FcD617D0a09a`
- **Private Key:** `0x7b304cd41e7a28ac145330d7157006269e96dc2e6b0ec9f81cd3a9644688d039`

---

## 📋 Safe Creation Checklist

For each team member:

- [ ] **Deborah Sale**
  - [ ] Create Safe at app.safe.global
  - [ ] Add 3 owners: Admin1 + Admin2 + 0x56f14787DCE5E9227004269ba126548911aaAc07
  - [ ] Set threshold: 2 of 3
  - [ ] Deploy Safe (note gas cost)
  - [ ] Record Safe address: _________________
  - [ ] Register in system via API
  - [ ] Test deposit with small amount

- [ ] **Gregory Ward**
  - [ ] Create Safe at app.safe.global
  - [ ] Add 3 owners: Admin1 + Admin2 + 0xf49963d00BD90D05eD53b8a8a73b84be6a71dacA
  - [ ] Set threshold: 2 of 3
  - [ ] Deploy Safe
  - [ ] Record Safe address: _________________
  - [ ] Register in system
  - [ ] Test deposit

- [ ] **Peter Rivera**
  - [ ] Create Safe at app.safe.global
  - [ ] Add 3 owners: Admin1 + Admin2 + 0x8b677dcD43e1d56c78044cf86dc77476DC6A1818
  - [ ] Set threshold: 2 of 3
  - [ ] Deploy Safe
  - [ ] Record Safe address: _________________
  - [ ] Register in system
  - [ ] Test deposit

- [ ] **Gary Krensel**
  - [ ] Create Safe at app.safe.global
  - [ ] Add 3 owners: Admin1 + Admin2 + 0x4A1B18bbA4E9102F2Be45C76E40ca81f447FB8f6
  - [ ] Set threshold: 2 of 3
  - [ ] Deploy Safe
  - [ ] Record Safe address: _________________
  - [ ] Register in system
  - [ ] Test deposit

---

## 🚀 Quick Start Guide

### Step 1: Create Safes (30-60 minutes total)

1. Go to https://app.safe.global
2. Connect wallet using **Admin 1** or **Admin 2** MetaMask
3. Click **"Create New Safe"**
4. Select **"Ethereum Mainnet"**
5. Name it: "[Member Name] - Commodity Wallet"
6. Add the 3 owners (2 admins + 1 member address from above)
7. Set threshold to **2**
8. Review and deploy (~$30-50 gas)
9. **SAVE THE SAFE ADDRESS** immediately
10. Repeat for all 4 members

### Step 2: Register Safes in System

```bash
cd /home/greg/dev/secure-usdt
node scripts/register-safes.js
```

### Step 3: Start USDT Monitoring

```bash
curl http://137.184.183.142:3000/indexer/start
```

### Step 4: Share Receiving Instructions

Send to each team member:

```
Your USDT Receiving Address: [Safe Address]

CRITICAL INSTRUCTIONS:
- Network: Ethereum Mainnet ONLY
- Token: USDT (ERC-20 contract: 0xdac17f958d2ee523a2206206994597c13d831ec7)
- DO NOT use Tron (TRC-20) or other networks
- Funds will show after 12 block confirmations (~3 minutes)

To check balance:
http://137.184.183.142:3000/wallet/balance/YOUR_SAFE_ADDRESS
```

---

## 🔐 Security Notes

1. **Private Keys Distribution:**
   - Each member gets ONLY their own private key
   - Admins keep admin keys
   - Store in password manager (1Password, Bitwarden, etc.)
   - Never share via email or Slack

2. **Safe Multisig Protection:**
   - 2 of 3 signatures required for ANY transaction
   - No single person can move funds
   - Admin keys provide company oversight

3. **Transaction Approval Flow:**
   - Member creates payout request in system
   - 2 approvals required (1 member + 1 admin, or 2 admins)
   - All transactions logged immutably

---

## 💰 Estimated Costs

- **Safe deployment**: ~$30-50 per Safe (4 Safes = ~$120-200 total)
- **Transaction fees**: ~$5-15 per USDT transfer (depends on gas)
- **Monthly costs**: $0 (no subscription fees)

---

## 📞 Support

If issues arise:
1. Check server status: `ssh root@137.184.183.142 "pm2 status"`
2. View logs: `ssh root@137.184.183.142 "pm2 logs commodex"`
3. Check [PRODUCTION_STATUS.md](./PRODUCTION_STATUS.md) for troubleshooting

---

## ⚠️ CRITICAL REMINDERS

- ✅ Ethereum Mainnet ONLY
- ✅ ERC-20 USDT contract: 0xdac17f958d2ee523a2206206994597c13d831ec7
- ❌ NO Tron (TRC-20)
- ❌ NO BSC or other chains
- ✅ Always verify network before sending
- ✅ Test with small amount first ($100-500)

---

**Ready to create the Safes? You have all the addresses above. Start with Deborah's Safe since she needs to receive USDT this week!**
