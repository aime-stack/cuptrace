# Contract Deployment Guide

## Where to Get Environment Variables

### 1. CARDANO_NODE_URL (Optional)

**You don't need this if you're using Blockfrost API!**

Since you already have `BLOCKFROST_API_KEY` set, you can leave `CARDANO_NODE_URL` empty. The Blockfrost API is used instead.

**Only set this if:**
- You want to use your own Cardano node instead of Blockfrost
- You have a local Cardano node running
- You're using a different node service provider

**If you need it:**
- Local node: `http://localhost:1337` (default Cardano node port)
- Node service: Contact your node provider for the URL

**For now:** Leave it empty ✅

---

### 2. BATCH_CONTRACT_ADDRESS

**How to get it:**

1. **Compile your contracts first:**
   ```bash
   cd contracts
   aiken build
   ```

2. **Deploy the contracts:**
   ```bash
   cd backend
   npm run deploy:contracts
   # or
   npx ts-node scripts/deploy-contracts.ts
   ```

3. **The deployment script will output:**
   ```
   💾 Add these to your .env file:
      BATCH_CONTRACT_ADDRESS=addr_test1...
   ```

4. **Copy the address** and add it to your `.env` file.

**What it is:**
- The Cardano address where the Batch Traceability Validator contract is deployed
- Generated automatically when you deploy the contract
- Looks like: `addr_test1...` (for Preprod) or `addr1...` (for Mainnet)

---

### 3. STAGE_CONTRACT_ADDRESS

**How to get it:**

Same process as `BATCH_CONTRACT_ADDRESS`:

1. **Deploy contracts** (see above)
2. **The deployment script will output:**
   ```
   💾 Add these to your .env file:
      STAGE_CONTRACT_ADDRESS=addr_test1...
   ```
3. **Copy the address** and add it to your `.env` file.

**What it is:**
- The Cardano address where the Stage Transition Validator contract is deployed
- Generated automatically when you deploy the contract
- Looks like: `addr_test1...` (for Preprod) or `addr1...` (for Mainnet)

---

## Prerequisites for Deployment

Before deploying contracts, you need:

1. ✅ **BLOCKFROST_API_KEY** - Already set in your .env
2. ✅ **CARDANO_NETWORK=preprod** - Already set
3. ⚠️ **WALLET_PRIVATE_KEY** - Need to set this
4. ⚠️ **Compiled contracts** - Need to compile Aiken contracts first

---

## Step-by-Step Deployment Process

### Step 1: Get a Test Wallet (for Preprod)

You need a wallet with test ADA on Preprod network:

1. **Option A: Use Nami or Eternl wallet**
   - Create a wallet
   - Switch to Preprod network
   - Get test ADA from [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)
   - Export the private key (be careful with security!)

2. **Option B: Generate a new wallet**
   ```bash
   # Using Lucid (you can create a script for this)
   # Or use cardano-cli to generate keys
   ```

### Step 2: Add WALLET_PRIVATE_KEY to .env

```env
WALLET_PRIVATE_KEY=ed25519_sk1...
```

⚠️ **Security Warning:** Never commit this to git! It's already in `.gitignore`.

### Step 3: Compile Contracts

```bash
cd contracts
aiken build
```

This creates `contracts/plutus.json` with compiled contracts.

### Step 4: Deploy Contracts

```bash
cd backend
npm run deploy:contracts
```

The script will:
- Load compiled contracts
- Deploy NFT Minting Policy (outputs `NFT_POLICY_ID`)
- Deploy Batch Traceability Validator (outputs `BATCH_CONTRACT_ADDRESS`)
- Deploy Stage Transition Validator (outputs `STAGE_CONTRACT_ADDRESS`)

### Step 5: Update .env File

Copy the output addresses to your `.env`:

```env
NFT_POLICY_ID=abc123...
BATCH_CONTRACT_ADDRESS=addr_test1...
STAGE_CONTRACT_ADDRESS=addr_test1...
```

---

## Quick Reference

| Variable | Where to Get | Required? |
|----------|-------------|-----------|
| `CARDANO_NODE_URL` | Leave empty (using Blockfrost) | ❌ Optional |
| `BATCH_CONTRACT_ADDRESS` | Run `npm run deploy:contracts` | ✅ After deployment |
| `STAGE_CONTRACT_ADDRESS` | Run `npm run deploy:contracts` | ✅ After deployment |
| `NFT_POLICY_ID` | Run `npm run deploy:contracts` | ✅ After deployment |
| `WALLET_PRIVATE_KEY` | Export from wallet or generate | ✅ For deployment |

---

## Current Status

✅ **Already Configured:**
- `BLOCKFROST_API_KEY` - Set
- `CARDANO_NETWORK` - Set to preprod

⚠️ **Need to Set:**
- `WALLET_PRIVATE_KEY` - Get from your Preprod wallet
- `BATCH_CONTRACT_ADDRESS` - After deploying contracts
- `STAGE_CONTRACT_ADDRESS` - After deploying contracts
- `NFT_POLICY_ID` - After deploying contracts

❌ **Can Leave Empty:**
- `CARDANO_NODE_URL` - Not needed when using Blockfrost

---

## Troubleshooting

**Q: Do I need CARDANO_NODE_URL?**
A: No, if you're using Blockfrost API (which you are), leave it empty.

**Q: When do I get the contract addresses?**
A: After running the deployment script. It will output them for you to copy.

**Q: Can I deploy without WALLET_PRIVATE_KEY?**
A: No, you need it to sign the deployment transactions.

**Q: How much ADA do I need?**
A: About 2-5 ADA on Preprod testnet (very cheap, get from faucet).

