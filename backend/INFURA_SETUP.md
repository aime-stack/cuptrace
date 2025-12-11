# Infura IPFS Setup Guide

## Step 1: Create Infura Account & Project

1. Go to https://infura.io
2. Click **"Sign Up"** (top right)
3. Enter your email and create a password
4. Verify your email
5. Log in to your Infura dashboard

## Step 2: Create IPFS Project

1. In the dashboard, click **"Create New Project"**
2. Select **"IPFS"** from the dropdown
3. Name your project (e.g., "CupTrace IPFS")
4. Click **"Create"**

## Step 3: Get Your Credentials

1. On the project page, you'll see:
   - **Project ID** (e.g., `abc123def456...`)
   - **Project Secret** (e.g., `xyz789uvw...`)

2. Copy both values

## Step 4: Create Base64 Encoded Auth

Your credentials need to be base64 encoded. Run this in PowerShell:

```powershell
$projectId = "YOUR_PROJECT_ID"
$projectSecret = "YOUR_PROJECT_SECRET"
$credentials = "$projectId:$projectSecret"
$base64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($credentials))
Write-Host "Base64 Auth: $base64"
```

Copy the output (the Base64 string).

## Step 5: Configure Backend

Create or edit `backend\.env.local` and add:

```bash
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_AUTH=Basic:YOUR_BASE64_STRING_HERE
```

**Example:**
```bash
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_AUTH=Basic:YWJjMTIzZGVmNDU2Onh5ejc4OXV2dw==
```

## Step 6: Restart Backend

In PowerShell (from the backend folder):

```powershell
# Stop the current backend (Ctrl+C)

# Restart it
npm run dev
```

## Step 7: Test IPFS Upload

Run the test script again:

```powershell
.\scripts\test-qc-minting.ps1 -BackendUrl "http://localhost:3001"
```

You should now see the **IPFS CID** populated in the test output!

## Verify Your Upload

Once you have an IPFS CID, you can view it at:

```
https://ipfs.io/ipfs/YOUR_CID_HERE
```

Example: `https://ipfs.io/ipfs/QmXxxx...`

---

## Troubleshooting

**Problem**: "IPFS upload failed" or empty CID  
**Solution**: Check that `IPFS_AUTH` is properly formatted and base64 encoded

**Problem**: "Connection refused" error  
**Solution**: Verify `IPFS_API_URL` is correct: `https://ipfs.infura.io:5001`

**Problem**: Still getting errors?  
**Solution**: Check backend logs for detailed error messages. Look for `[QC APPROVAL]` log lines.

---

## Next: Set Blockfrost for On-Chain Testing

Once IPFS is working, you can set up Blockfrost for Cardano preprod:

1. Go to https://blockfrost.io
2. Sign up and create a preprod project
3. Copy your API key
4. Add to `.env.local`:
   ```bash
   BLOCKFROST_API_KEY=your_blockfrost_api_key
   CARDANO_NETWORK=preprod
   WALLET_PRIVATE_KEY=your_funded_wallet_key
   ```

Then you'll have full on-chain NFT minting with Cardano!
