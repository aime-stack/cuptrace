# Quick Start: Testing QC Approval and Minting on Preprod

## 5-Minute Setup

### 1. Configure Environment

Edit `backend/.env`:

```bash
# Network
CARDANO_NETWORK=preprod
BLOCKFROST_API_KEY=preprodxxxxx

# Wallet (get test ADA from faucet first)
WALLET_PRIVATE_KEY=xprvA1JofJ1Jkyx...

# NFT Policy (optional, for now you can use the basic policy)
# NFT_POLICY_ID=abcdef1234...

# IPFS (optional, defaults to Infura)
IPFS_API_URL=https://ipfs.infura.io:5001
# IPFS_AUTH=Basic base64(projectId:secret)  # Uncomment if using Infura with auth
```

### 2. Ensure Test Users Exist

Run seed script or manually insert users:

```sql
-- Farmer
INSERT INTO public."User" (id, email, name, "password", role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'farmer@test.local',
  'Test Farmer',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6', -- password: password
  'farmer',
  true,
  NOW(),
  NOW()
);

-- QC
INSERT INTO public."User" (id, email, name, "password", role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'qc@test.local',
  'Test QC',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6', -- password: password
  'qc',
  true,
  NOW(),
  NOW()
);
```

### 3. Get Test ADA

1. Visit https://docs.cardano.org/cardano-testnet/tools/faucet or use the Preprod faucet
2. Paste your wallet address
3. Request test ADA (1-2 lovelace)
4. Wait ~2 minutes for confirmation

**Check balance:**
```powershell
$addr = "addr_test1..." # Your address
$key = "preprodxxxxx"   # Your BLOCKFROST_API_KEY

Invoke-WebRequest -Uri "https://cardano-preprod.blockfrost.io/api/v0/addresses/$addr" `
  -Headers @{"project_id" = $key} | ConvertFrom-Json | Select-Object amount
```

### 4. Start Backend

```powershell
cd backend
npm install  # if not already done
npm run dev
```

You should see:
```
✅ Server running on http://localhost:3000
🔌 Connecting to Blockfrost...
📡 Connected to Cardano network
```

### 5. Run Test Script

```powershell
cd backend
.\scripts\test-qc-minting.ps1
```

Or with custom credentials:
```powershell
.\scripts\test-qc-minting.ps1 `
  -FarmerEmail "farmer@test.local" `
  -FarmerPassword "password" `
  -QCEmail "qc@test.local" `
  -QCPassword "password"
```

**Expected output:**
```
╔═══════════════════════════════════════════════════════════════╗
║ Step 1: Checking Backend Health                              ║
╚═══════════════════════════════════════════════════════════════╝

✅ Backend is running at http://localhost:3000

[... continues through all steps ...]

╔═══════════════════════════════════════════════════════════════╗
║ Test Summary                                                  ║
╚═══════════════════════════════════════════════════════════════╝

✅ Test completed successfully!

Key Results:
  Batch ID:              abc-123-def
  Status:                Approved
  IPFS CID:              QmXxxxxx
  NFT Minted:            Yes
```

## What the Test Does

1. ✅ Authenticates as farmer → creates a batch
2. ✅ Authenticates as QC → approves batch
3. ✅ Backend creates approval UTxO on-chain
4. ✅ Metadata uploaded to IPFS
5. ✅ NFT minted with IPFS link
6. ✅ Verifies all transactions on Blockfrost
7. ✅ Checks batch integrity

## View Results

### 1. Check Blockfrost Explorer

Paste transaction hashes at: https://preprod.cardanoscan.io/

### 2. Check IPFS Metadata

Open the IPFS URL from test output:
```
https://ipfs.io/ipfs/QmXxxxxx
```

You should see JSON metadata with batch details.

### 3. Check Batch Verification

Open the verification URL from test output:
```
http://localhost:3000/api/coffee/verify/...
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Backend not reachable" | Run `npm run dev` in `backend/` folder |
| "Unauthorized" (401) | Check test user exists in DB |
| "WALLET_PRIVATE_KEY not configured" | Add to `.env` and restart backend |
| "Blockfrost API error" | Check `BLOCKFROST_API_KEY` is valid |
| "No approval UTxO found" | Wait a few seconds, UTxO confirmation takes time |
| "IPFS upload failed" | Check `IPFS_API_URL` is reachable |

## Manual Testing (Alternative)

If you prefer manual API calls instead of the script:

### Login as Farmer
```powershell
$body = @{ email = "farmer@test.local"; password = "password" } | ConvertTo-Json
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -Headers @{"Content-Type"="application/json"}
$token = ($r.Content | ConvertFrom-Json).data.token
```

### Create Batch
```powershell
$batch = @{
  originLocation = "Rwanda"
  grade = "A"
  quantity = 100
  # ... more fields
} | ConvertTo-Json
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/coffee" -Method POST -Body $batch -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"}
$batchId = ($r.Content | ConvertFrom-Json).data.id
```

### QC Approve
```powershell
# Login as QC first
$qcToken = ... # from QC login

$r = Invoke-WebRequest -Uri "http://localhost:3000/api/coffee/$batchId/approve" -Method POST -Headers @{"Authorization"="Bearer $qcToken"}
$result = $r.Content | ConvertFrom-Json
$result.data  # View approval result
```

## Next Steps

Once testing passes on preprod:

1. **Document findings** — note any differences from expected behavior
2. **Run regression tests** — create multiple batches, test edge cases
3. **Load test** — try multiple concurrent approvals
4. **Mainnet prep** — review security, audit code, plan mainnet deployment

See `TESTING_GUIDE_PREPROD.md` for detailed testing steps and manual verification.
