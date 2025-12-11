# CupTrace QC-Approval-to-Minting Testing Guide (Cardano Preprod)

## Overview

This guide walks you through testing the complete QC approval and NFT minting workflow on Cardano Preprod. The flow is:

1. **Farmer creates a batch** → batch is stored, no NFT minted yet.
2. **QC reviews and approves** → backend creates on-chain approval UTxO, uploads metadata to IPFS, mints NFT.
3. **Verify results** → check on-chain UTxOs, NFT existence, IPFS metadata link.

## Prerequisites

### Environment Setup
Ensure your `.env` file in `backend/` has:

```bash
# Cardano Network
CARDANO_NETWORK=preprod
BLOCKFROST_API_KEY=<your_preprod_key>

# Wallet (must have test ADA on preprod)
WALLET_PRIVATE_KEY=<your_private_key>

# NFT Policy ID (if deployed)
NFT_POLICY_ID=<policy_id_from_deploy>

# IPFS
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_AUTH=Basic <base64_encoded_projectId:projectSecret>  # Optional for Infura

# Database
DATABASE_URL=<your_database_connection_string>
```

### Test Wallet

Get test ADA on preprod:
1. Go to https://docs.cardano.org/cardano-testnet/tools/faucet (or Preprod faucet).
2. Paste your wallet address and request test ADA.
3. Wait ~2 minutes for confirmation.
4. Verify with:
   ```powershell
   # Check wallet balance via Blockfrost API
   Invoke-WebRequest -Uri "https://cardano-preprod.blockfrost.io/api/v0/addresses/<your_address>" `
     -Headers @{"project_id" = "<BLOCKFROST_API_KEY>"} | ConvertFrom-Json | Select-Object amount
   ```

### Test Users

Create test users in the database:

**Farmer user:**
```sql
INSERT INTO public."User" (id, email, name, "password", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'farmer-test-001',
  'farmer@test.local',
  'Test Farmer',
  '$2b$10$...', -- bcrypt hash of password, e.g., 'farmer123'
  'farmer',
  true,
  NOW(),
  NOW()
);
```

**QC (Quality Controller) user:**
```sql
INSERT INTO public."User" (id, email, name, "password", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'qc-test-001',
  'qc@test.local',
  'Test QC',
  '$2b$10$...', -- bcrypt hash of password, e.g., 'qc123'
  'qc',
  true,
  NOW(),
  NOW()
);
```

Or use the provided seed scripts:
```powershell
cd backend
# If seed scripts exist, run them
npm run prisma:seed
```

### Start Backend

```powershell
cd backend
npm run dev
```

Expected output:
```
✅ Server running on http://localhost:3000
🔌 Connecting to Blockfrost: https://cardano-preprod.blockfrost.io/api/v0
📡 Connected to Cardano network: Testnet (preprod)
```

## Testing Flow

### Step 1: Authenticate as Farmer

Get an auth token for the farmer user:

```powershell
$body = @{
  email    = "farmer@test.local"
  password = "farmer123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body $body

$token = ($response.Content | ConvertFrom-Json).data.token
echo "Farmer token: $token"
```

Save this token as `$farmerToken`.

### Step 2: Create a Coffee Batch

As the farmer, create a batch:

```powershell
$batchBody = @{
  originLocation = "Huye, Rwanda"
  region         = "Southern"
  district       = "Huye"
  sector         = "Gitarama"
  cell           = "Ruhango"
  village        = "Ikembe"
  lotId          = "BATCH-PREPROD-001"
  quantity       = 100
  quality        = "Premium Washed"
  moisture       = 11.5
  harvestDate    = (Get-Date).AddDays(-10).ToString("yyyy-MM-dd")
  processingType = "Washed"
  grade          = "A"
  description    = "High-quality Arabica, full-bodied flavor profile"
  tags           = @("arabica", "washed", "premium")
} | ConvertTo-Json

$batchResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/coffee" `
  -Method POST `
  -Headers @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $farmerToken"
  } `
  -Body $batchBody

$batch = $batchResponse.Content | ConvertFrom-Json
$batchId = $batch.data.id

echo "✅ Batch created: $batchId"
echo "   Status: $($batch.data.status)"
echo "   Lot ID: $($batch.data.lotId)"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "id": "batch-uuid-001",
    "status": "pending",
    "type": "coffee",
    "originLocation": "Huye, Rwanda",
    "lotId": "BATCH-PREPROD-001",
    "quantity": 100,
    "grade": "A",
    "nftPolicyId": null,
    "nftAssetName": null,
    "nftMintedAt": null,
    "qrCode": "...",
    "verificationUrl": "...",
    "createdAt": "..."
  }
}
```

### Step 3: Authenticate as QC

Get an auth token for the QC user:

```powershell
$qcBody = @{
  email    = "qc@test.local"
  password = "qc123"
} | ConvertTo-Json

$qcResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body $qcBody

$qcToken = ($qcResponse.Content | ConvertFrom-Json).data.token
echo "QC token: $qcToken"
```

Save this token as `$qcToken`.

### Step 4: QC Approves Batch (Triggers Minting)

As QC, approve the batch. This should:
- Create an on-chain approval UTxO at the Batch Traceability validator.
- Upload metadata to IPFS.
- Mint the NFT (if using QC-enforced policy, it will consume the approval UTxO).

```powershell
$approveBody = @{} | ConvertTo-Json

$approveResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/coffee/$batchId/approve" `
  -Method POST `
  -Headers @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $qcToken"
  } `
  -Body $approveBody

$approveResult = $approveResponse.Content | ConvertFrom-Json

echo "✅ Batch approved by QC"
echo "   Approval Tx Hash: $($approveResult.data.approvalTxHash)"
echo "   IPFS CID: $($approveResult.data.ipfsCid)"
echo "   NFT Minted: $($approveResult.data.nft -ne $null)"
if ($approveResult.data.nft) {
  echo "   NFT Policy ID: $($approveResult.data.nft.policyId)"
  echo "   NFT Asset Name: $($approveResult.data.nft.assetName)"
  echo "   NFT Mint Tx: $($approveResult.data.nft.txHash)"
}
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "batch": {
      "id": "batch-uuid-001",
      "status": "approved",
      "nftPolicyId": "abcdef1234...",
      "nftAssetName": "...",
      "nftMintedAt": "2025-12-11T12:34:56Z",
      "metadata": {
        "ipfsCid": "QmXxxxx..."
      }
    },
    "nft": {
      "policyId": "abcdef1234...",
      "assetName": "...",
      "txHash": "txhash123..."
    },
    "ipfsCid": "QmXxxxx...",
    "approvalTxHash": "approvaltxhash..."
  }
}
```

**Key outputs to note:**
- `approvalTxHash` — the on-chain approval UTxO transaction.
- `ipfsCid` — the IPFS hash of the metadata (stored off-chain).
- `nft.txHash` — the minting transaction hash.

### Step 5: Verify on-Chain Results

#### Check Approval UTxO (Blockfrost API)

Verify that the approval UTxO was created and is locked at the validator:

```powershell
$approvalTxHash = "..." # from step 4

# Get transaction details from Blockfrost
$txResponse = Invoke-WebRequest -Uri "https://cardano-preprod.blockfrost.io/api/v0/txs/$approvalTxHash" `
  -Headers @{ "project_id" = "<BLOCKFROST_API_KEY>" }

$tx = $txResponse.Content | ConvertFrom-Json

echo "✅ Approval Transaction verified:"
echo "   Tx Hash: $($tx.hash)"
echo "   Block: $($tx.block)"
echo "   Status: $($tx.block -ne $null ? 'Confirmed' : 'Pending')"
```

#### Check NFT Minting Transaction

```powershell
$nftTxHash = "..." # from step 4

$nftTxResponse = Invoke-WebRequest -Uri "https://cardano-preprod.blockfrost.io/api/v0/txs/$nftTxHash" `
  -Headers @{ "project_id" = "<BLOCKFROST_API_KEY>" }

$nftTx = $nftTxResponse.Content | ConvertFrom-Json

echo "✅ NFT Minting Transaction verified:"
echo "   Tx Hash: $($nftTx.hash)"
echo "   Block: $($nftTx.block)"
echo "   Status: $($nftTx.block -ne $null ? 'Confirmed' : 'Pending')"
```

#### Verify NFT Asset Exists

Check if the NFT asset was minted:

```powershell
$policyId = "..." # from step 4
$assetName = "..." # from step 4
$fullAssetId = "$policyId$assetName"

$assetResponse = Invoke-WebRequest -Uri "https://cardano-preprod.blockfrost.io/api/v0/assets/$fullAssetId" `
  -Headers @{ "project_id" = "<BLOCKFROST_API_KEY>" }

$asset = $assetResponse.Content | ConvertFrom-Json

echo "✅ NFT Asset verified:"
echo "   Asset ID: $($asset.asset)"
echo "   Policy ID: $($asset.policy_id)"
echo "   Quantity: $($asset.quantity)"
echo "   Mint Transactions: $($asset.mint_count)"
```

#### Check IPFS Metadata

Verify the metadata is accessible on IPFS:

```powershell
$ipfsCid = "..." # from step 4

# Try IPFS gateway
$ipfsUrl = "https://ipfs.io/ipfs/$ipfsCid"
echo "IPFS Metadata URL: $ipfsUrl"

# Fetch and display
$ipfsResponse = Invoke-WebRequest -Uri $ipfsUrl

$metadata = $ipfsResponse.Content | ConvertFrom-Json

echo "✅ IPFS Metadata retrieved:"
echo "   Name: $($metadata.name)"
echo "   Description: $($metadata.description)"
echo "   Attributes:"
echo "     - Batch ID: $($metadata.attributes.batchId)"
echo "     - Type: $($metadata.attributes.type)"
echo "     - Origin: $($metadata.attributes.originLocation)"
```

### Step 6: Query Batch via Verification Endpoint

Verify the batch via the public verification endpoint:

```powershell
# Use the QR code or batch ID to verify
$qrCode = "..." # from batch creation (step 2)

$verifyResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/coffee/verify/$qrCode"

$verified = $verifyResponse.Content | ConvertFrom-Json

echo "✅ Batch verification:"
echo "   Verified: $($verified.data.verified)"
echo "   Status: $($verified.data.batch.status)"
echo "   NFT Minted: $($verified.data.batch.nftPolicyId -ne $null)"
echo "   Verification Result:"
echo "     - Is Valid: $($verified.data.verificationResult.isValid)"
echo "     - Tampered: $($verified.data.verificationResult.tampered)"
echo "     - Issues: $($verified.data.verificationResult.issues.Count)"
```

## Complete PowerShell Test Script

A full test script is available in `scripts/test-qc-minting.ps1`. Run it with:

```powershell
cd backend
.\scripts\test-qc-minting.ps1 `
  -FarmerEmail "farmer@test.local" `
  -FarmerPassword "farmer123" `
  -QCEmail "qc@test.local" `
  -QCPassword "qc123"
```

## Troubleshooting

### Issue: "WALLET_PRIVATE_KEY not configured"

**Cause:** Backend `.env` missing `WALLET_PRIVATE_KEY`.

**Fix:** Add your preprod wallet private key to `.env` and restart backend.

```bash
WALLET_PRIVATE_KEY=xprvA1JofJ1Jkyx...
```

### Issue: "Blockfrost API error: Unauthorized"

**Cause:** Invalid or expired `BLOCKFROST_API_KEY`.

**Fix:** Generate a new key at https://blockfrost.io and update `.env`.

### Issue: "No approval UTxO found for batch; minting may fail"

**Cause:** The approval UTxO creation failed or was not confirmed yet.

**Fix:** Check the approval transaction hash:
- Is it confirmed on-chain?
- Does it have outputs locked at the validator address?
- Retry approval after a few seconds.

### Issue: "IPFS upload failed"

**Cause:** IPFS API URL unreachable or authentication failed.

**Fix:** Check `.env`:
- `IPFS_API_URL` should be reachable.
- If using Infura, ensure `IPFS_AUTH` is set to a valid Basic auth header.

### Issue: "NFT minting transaction failed"

**Cause:** Policy script error or invalid redeemer.

**Fix:**
- Check backend logs for the exact error.
- Verify the policy ID in `.env` matches the deployed policy.
- Ensure the redeemer structure is correct (should be `{ Mint: { batch_id: ... } }`).

## Useful Commands

### Deploy Contracts (if needed)

```powershell
cd backend
npm run deploy-contracts
```

This will output policy IDs to add to `.env`.

### Test Contract Integration

```powershell
cd backend
npm run test-contracts
```

### Check Wallet Balance

```powershell
# Via Blockfrost
Invoke-WebRequest -Uri "https://cardano-preprod.blockfrost.io/api/v0/addresses/<address>" `
  -Headers @{"project_id" = "<KEY>"} | ConvertFrom-Json | Select-Object amount
```

### Query UTxOs at Address

```powershell
# Via Blockfrost
Invoke-WebRequest -Uri "https://cardano-preprod.blockfrost.io/api/v0/addresses/<address>/utxos" `
  -Headers @{"project_id" = "<KEY>"} | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

### View Transaction on Explorer

Use Preprod explorer:
- https://preprod.cardanoscan.io/
- https://testnet.cardano.org/en/testnets/cardano/tools/

Paste transaction hash to view details.

## Regression Testing Checklist

After any code changes, verify:

- [ ] Farmer can create batch (NFT not minted)
- [ ] QC can approve batch
- [ ] Approval UTxO is created on-chain
- [ ] Metadata uploaded to IPFS successfully
- [ ] NFT minted with correct policy ID and asset name
- [ ] NFT metadata points to IPFS CID
- [ ] Batch verification endpoint returns correct data
- [ ] Batch integrity check passes (no tampering detected)
- [ ] QC cannot approve an already-approved batch
- [ ] Non-QC users cannot approve batches (403 error)
- [ ] Retry mint endpoint works if initial mint failed

## Next Steps

1. **Run the test script** (`test-qc-minting.ps1`) to validate the complete flow.
2. **Check Blockfrost explorer** to visually confirm transactions.
3. **Verify IPFS metadata** is accessible and contains all expected fields.
4. **Test edge cases:**
   - Approve same batch twice (should fail).
   - Non-QC user attempts approval (should be denied).
   - Batch with missing metadata fields.
5. **Once working**, document findings and move to mainnet or integration testing.

## Support

For issues:
1. Check backend logs (`npm run dev` output).
2. Check Blockfrost API responses.
3. Verify `.env` configuration.
4. Review transaction hash on Cardano explorer.
