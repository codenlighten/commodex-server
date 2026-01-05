# RevelNation Secure USDT Wallet System

**Built for Deborah and the team to receive USDT securely for high-value commodity deals.**

## 🔐 Security Architecture

- **No private keys on server** - Ever. Zero. Nada.
- **Safe multisig wallets** - 2-of-3 approval for all spending
- **Passkey authentication** - Phish-resistant WebAuthn
- **Unlimited deposits** - No caps, only confirmations
- **Strict payout controls** - Multi-approval workflow

---

## 🚀 Quick Start (Get Deborah's Wallet Ready This Week)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - Your PostgreSQL connection string
- `ETHEREUM_RPC_URL` - Alchemy/Infura API key
- `JWT_SECRET` - Random 32+ character string
- `ADMIN_SIGNER_1` - Your admin wallet address
- `ADMIN_SIGNER_2` - Second admin wallet address

### 3. Initialize Database

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start the Server

```bash
npm run start:dev
```

Server runs on `http://localhost:3000`

---

## 📋 Setting Up Deborah's Wallet (Step-by-Step)

### Step 1: Deborah Registers

Have Deborah visit your frontend and register with:
- Email: deborah@revelnation.com
- Name: Deborah Sale

She'll create a passkey (fingerprint/face ID on her device).

### Step 2: Create Her Safe

**Option A: Manual (Recommended for Week 1)**

1. Go to https://app.safe.global
2. Connect with one of your admin wallets
3. Create new Safe with 3 owners:
   - Deborah's passkey-derived address
   - Your admin address 1
   - Your admin address 2
4. Set threshold to 2
5. Deploy the Safe
6. Copy the Safe address

**Option B: Via API (Coming Soon)**

```bash
POST /wallet/create
{
  "passkeyAddress": "0xDeborahsPasskeyAddress"
}
```

### Step 3: Register the Safe

```bash
POST /wallet/register
Authorization: Bearer {Deborah's JWT token}
{
  "safeAddress": "0xTheSafeAddress"
}
```

### Step 4: Start Monitoring

```bash
# This starts watching for USDT deposits
GET /indexer/start
```

### Step 5: Share Address with Counterparties

Deborah can now share her Safe address to receive USDT:

```
Send USDT (ERC-20 on Ethereum) to:
0x[Deborah's Safe Address]

⚠️ IMPORTANT: Only Ethereum mainnet ERC-20 USDT
   DO NOT send TRC-20 (Tron) or other chains
```

---

## 🎯 What Happens When USDT Arrives

1. **Instant Detection** - Indexer sees the Transfer event
2. **Pending Status** - Recorded immediately with 0 confirmations
3. **Confirmed Status** - After 6 blocks (~75 seconds)
4. **Final Status** - After 12 blocks (~2.5 minutes)

Deborah can see her balance immediately in the portal.

---

## 💸 Making Payouts (Secure Workflow)

### 1. Create Payout Request

```bash
POST /payout/request
Authorization: Bearer {token}
{
  "toAddress": "0xSellerAddress",
  "amount": "50000.00",
  "purpose": "Payment for commodity deal #12345"
}
```

### 2. Approve (2 Required)

In production, two approvers must review and approve.

### 3. Execute via Safe

1. Go to https://app.safe.global
2. Select Deborah's Safe
3. Create transaction to USDT contract
4. Get 2 signatures
5. Execute

**The app never signs transactions - only proposes them.**

---

## 📊 API Endpoints

### Authentication
- `POST /auth/register/begin` - Start registration
- `POST /auth/register/complete` - Complete registration
- `POST /auth/login/begin` - Start login
- `POST /auth/login/complete` - Complete login

### Wallet Management
- `POST /wallet/create` - Get Safe deployment instructions
- `POST /wallet/register` - Register existing Safe
- `GET /wallet/my-wallets` - Get user's wallets with balances

### Indexer
- `GET /indexer/status` - Check monitoring status
- `POST /indexer/start` - Start monitoring deposits

### Payouts
- `POST /payout/request` - Create payout request
- `GET /payout/my-requests` - View payout requests

---

## 🔧 Database Schema

Key tables:
- **users** - Team members with passkeys
- **wallets** - Safe addresses and configurations
- **ledger_entries** - All deposits (immutable)
- **payout_requests** - Withdrawal requests
- **approvals** - Multi-sig approval tracking
- **audit_events** - Complete audit trail

---

## 🛡️ Security Checklist

✅ No private keys in code, DB, or env vars
✅ All spending requires 2-of-3 multisig
✅ Passkey authentication (phish-resistant)
✅ Deposit confirmations (12 blocks)
✅ Idempotent deposit processing
✅ Immutable audit log
✅ Address validation
✅ Separation of duties (requester ≠ approver)

---

## 🚨 For Production

Before going live:

1. **Use Ethereum Mainnet** - Update `.env`
2. **Real Admin Addresses** - Set actual co-signers
3. **Secure JWT Secret** - Generate strong random string
4. **Database Backups** - Set up automated backups
5. **Monitoring** - Set up alerts for large deposits
6. **SSL/TLS** - Use HTTPS in production
7. **Rate Limiting** - Add API rate limits
8. **KYC/AML** - Implement sanctions screening

---

## 📞 Support

If you need help:
- Check logs: `npm run start:dev` shows all activity
- Database GUI: `npm run prisma:studio`
- Safe Dashboard: https://app.safe.global

---

## 🎓 Architecture Principles

From the spec in `overview.md`:

1. **Trust Zones** - API, Orchestrator, Indexer, Signing (separate)
2. **No Hot Keys** - Server never signs transactions
3. **Unlimited Deposits** - Only confirmations, no caps
4. **Strict Withdrawals** - Multi-approval + address verification
5. **Audit Everything** - Immutable event log

---

**Built with love for secure commodity deals. 💎**
