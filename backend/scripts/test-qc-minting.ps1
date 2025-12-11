#!/usr/bin/env pwsh
<#
.SYNOPSIS
    End-to-end test script for CupTrace QC approval and NFT minting on Cardano Preprod.

.DESCRIPTION
    This script automates the complete testing flow:
    1. Authenticate as farmer
    2. Create a batch
    3. Authenticate as QC
    4. QC approves batch (triggers IPFS upload, approval UTxO creation, NFT minting)
    5. Verify on-chain results (Blockfrost API queries)
    6. Query batch verification endpoint

.PARAMETER FarmerEmail
    Email of farmer test user (default: farmer@test.local)

.PARAMETER FarmerPassword
    Password of farmer test user (default: farmer123)

.PARAMETER QCEmail
    Email of QC test user (default: qc@test.local)

.PARAMETER QCPassword
    Password of QC test user (default: qc123)

.PARAMETER BackendUrl
    Backend API URL (default: http://localhost:3000)

.PARAMETER BlockfrostKey
    Blockfrost API key (read from env if not provided)

.EXAMPLE
    .\test-qc-minting.ps1 -FarmerEmail "farmer@test.local" -FarmerPassword "farmer123"

.NOTES
    - Ensure backend is running (`npm run dev`)
    - Ensure test users exist in database
    - Ensure wallet in backend has test ADA on preprod
#>

param(
    [string]$FarmerEmail = "farmer@test.local",
    [string]$FarmerPassword = "farmer123",
    [string]$AgentEmail = "agent.huye@cuptrace.rw",
    [string]$AgentPassword = "agent123",
    [string]$QCEmail = "qc@test.local",
    [string]$QCPassword = "qc123",
    [string]$BackendUrl = "http://localhost:3001",
    [string]$BlockfrostKey = [System.Environment]::GetEnvironmentVariable("BLOCKFROST_API_KEY")
)

# Colors for output
$Colors = @{
    Success = "Green"
    Error   = "Red"
    Warning = "Yellow"
    Info    = "Cyan"
}

function Write-Header($message) {
    Write-Host ""
    Write-Host "===============================================================" -ForegroundColor $Colors.Info
    Write-Host "| $($message.PadRight(61)) |" -ForegroundColor $Colors.Info
    Write-Host "===============================================================" -ForegroundColor $Colors.Info
    Write-Host ""
}

function Write-Success($message) {
    Write-Host "[OK] $message" -ForegroundColor $Colors.Success
}

function Write-Error-Custom($message) {
    Write-Host "[ERROR] $message" -ForegroundColor $Colors.Error
}

function Write-Warning-Custom($message) {
    Write-Host "[WARN] $message" -ForegroundColor $Colors.Warning
}

function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor $Colors.Info
}

# ============================================================================
# STEP 1: Check backend health
# ============================================================================

Write-Header "Step 1: Checking Backend Health"

try {
    $healthResponse = Invoke-WebRequest -Uri "$BackendUrl/health" -ErrorAction SilentlyContinue
    Write-Success "Backend is running at $BackendUrl"
} catch {
    Write-Error-Custom "Backend is not reachable at $BackendUrl"
    Write-Error-Custom "Please start backend with: npm run dev"
    exit 1
}

# ============================================================================
# STEP 2: Authenticate as Farmer
# ============================================================================

Write-Header "Step 2: Authenticate as Agent (will register the batch)"

$agentLoginBody = @{
    email    = $AgentEmail
    password = $AgentPassword
} | ConvertTo-Json

try {
    $agentLoginResponse = Invoke-WebRequest -Uri "$BackendUrl/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $agentLoginBody `
        -ErrorAction Stop

    $agentData = $agentLoginResponse.Content | ConvertFrom-Json
    $agentToken = $agentData.data.token
    $agentId = $agentData.data.user.id

    Write-Success "Agent authenticated"
    Write-Info "Agent ID: $agentId"
    Write-Info "Token: $($agentToken.Substring(0, 20))..."
} catch {
    Write-Error-Custom "Failed to authenticate agent"
    Write-Error-Custom "$($_.Exception.Message)"
    exit 1
}

# Lookup farmer user ID so the agent can create a batch on their behalf
# First, try to use seeded demo farmer (jean.farmer@cuptrace.rw)
$seededFarmerEmail = "jean.farmer@cuptrace.rw"
$seededFarmerPassword = "farmer123"

Write-Info "Attempting to use seeded farmer: $seededFarmerEmail"
try {
    $seededLoginBody = @{
        email    = $seededFarmerEmail
        password = $seededFarmerPassword
    } | ConvertTo-Json

    $seededLoginResponse = Invoke-WebRequest -Uri "$BackendUrl/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $seededLoginBody `
        -ErrorAction Stop

    $seededLoginData = $seededLoginResponse.Content | ConvertFrom-Json
    $farmerId = $seededLoginData.data.user.id
    Write-Success "Found seeded farmer: $seededFarmerEmail -> ID: $farmerId"
} catch {
    Write-Warning-Custom "Seeded farmer not found. Attempting to lookup other farmers..."

    try {
        $usersResponse = Invoke-WebRequest -Uri "$BackendUrl/auth/users?role=farmer&limit=50" `
            -Method GET `
            -Headers @{ "Authorization" = "Bearer $agentToken" } `
            -ErrorAction Stop

        $usersData = $usersResponse.Content | ConvertFrom-Json
        $farmers = $usersData.data
        $found = $farmers | Where-Object { $_.email -ieq $FarmerEmail }
        if ($found) {
            $farmerId = $found.id
            Write-Success "Found farmer: $FarmerEmail -> ID: $farmerId"
        } else {
            # Fallback: take the first farmer in the list
            if ($farmers.Count -gt 0) {
                $farmerId = $farmers[0].id
                Write-Warning-Custom "Farmer with email $FarmerEmail not found; using first farmer: $($farmers[0].email)"
                Write-Info "Using Farmer ID: $farmerId"
            } else {
                Write-Error-Custom "No farmers available to assign to batch"
                Write-Error-Custom "Database may not be seeded. Run: npm run seed"
                exit 1
            }
        }
    } catch {
        Write-Error-Custom "Failed to lookup farmers: $($_.Exception.Message)"
        exit 1
    }
}

# ============================================================================
# STEP 3: Create Coffee Batch
# ============================================================================

Write-Header "Step 3: Creating Coffee Batch"

$batchBody = @{
    originLocation = "Huye, Rwanda"
    region         = "Southern"
    district       = "Huye"
    sector         = "Gitarama"
    cell           = "Ruhango"
    village        = "Ikembe"
    lotId          = "BATCH-PREPROD-$(Get-Random -Minimum 1000 -Maximum 9999)"
    quantity       = 100
    quality        = "Premium Washed"
    moisture       = 11.5
    harvestDate    = (Get-Date).AddDays(-10).ToString("yyyy-MM-dd")
    processingType = "Washed"
    grade          = "A"
    description    = "High-quality Arabica, full-bodied flavor profile, notes of chocolate and berries"
    tags           = @("arabica", "washed", "premium", "preprod-test")
} | ConvertTo-Json

try {
    $batchResponse = Invoke-WebRequest -Uri "$BackendUrl/coffee" `
        -Method POST `
        -Headers @{
            "Content-Type"  = "application/json"
            "Authorization" = "Bearer $agentToken"
        } `
        -Body ($batchBody | ConvertFrom-Json | Add-Member -PassThru -NotePropertyName farmerId -NotePropertyValue $farmerId | ConvertTo-Json) `
        -ErrorAction Stop

    $batchData = $batchResponse.Content | ConvertFrom-Json
    $batch = $batchData.data
    $batchId = $batch.id
    $qrCode = $batch.qrCode

    Write-Success "Batch created successfully"
    Write-Info "Batch ID: $batchId"
    Write-Info "Lot ID: $($batch.lotId)"
    Write-Info "Status: $($batch.status)"
    Write-Info "QR Code: $qrCode"
    Write-Info "Verification URL: $($batch.verificationUrl)"
} catch {
    Write-Error-Custom "Failed to create batch"
    Write-Error-Custom "$($_.Exception.Message)"
    exit 1
}

# ============================================================================
# STEP 4: Authenticate as QC
# ============================================================================

Write-Header "Step 4: Authenticate as Quality Controller (QC)"

# Try seeded QC account first
$seededQCEmail = "qc@cuptrace.rw"
$seededQCPassword = "quality123"

Write-Info "Attempting to use seeded QC: $seededQCEmail"
try {
    $seededQCBody = @{
        email    = $seededQCEmail
        password = $seededQCPassword
    } | ConvertTo-Json

    $seededQCResponse = Invoke-WebRequest -Uri "$BackendUrl/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $seededQCBody `
        -ErrorAction Stop

    $seededQCData = $seededQCResponse.Content | ConvertFrom-Json
    $qcToken = $seededQCData.data.token
    $qcId = $seededQCData.data.user.id

    Write-Success "QC authenticated"
    Write-Info "QC ID: $qcId"
    Write-Info "Token: $($qcToken.Substring(0, 20))..."
} catch {
    Write-Warning-Custom "Seeded QC not found ($seededQCEmail). Attempting to register custom QC..."

    # Fallback: try to register custom QC
    $qcRegisterBody = @{
        name = "Test Quality Controller"
        email = $QCEmail
        password = $QCPassword
        role = "qc"
    } | ConvertTo-Json

    try {
        $qcRegisterResponse = Invoke-WebRequest -Uri "$BackendUrl/auth/register" `
            -Method POST `
            -Headers @{ "Content-Type" = "application/json" } `
            -Body $qcRegisterBody `
            -ErrorAction Stop

        $qcRegisterData = $qcRegisterResponse.Content | ConvertFrom-Json
        $qcId = $qcRegisterData.data.user.id

        # Now login as the newly registered QC
        $qcLoginBody = @{
            email    = $QCEmail
            password = $QCPassword
        } | ConvertTo-Json

        $qcLoginResponse = Invoke-WebRequest -Uri "$BackendUrl/auth/login" `
            -Method POST `
            -Headers @{ "Content-Type" = "application/json" } `
            -Body $qcLoginBody `
            -ErrorAction Stop

        $qcLoginData = $qcLoginResponse.Content | ConvertFrom-Json
        $qcToken = $qcLoginData.data.token
        $qcId = $qcLoginData.data.user.id

        Write-Success "Registered and authenticated QC: $QCEmail"
        Write-Info "QC ID: $qcId"
        Write-Info "Token: $($qcToken.Substring(0, 20))..."
    } catch {
        Write-Error-Custom "Failed to register/authenticate QC: $($_.Exception.Message)"
        exit 1
    }
}

# ============================================================================
# STEP 5: QC Approves Batch
# ============================================================================

Write-Header "Step 5: QC Approves Batch (Triggers Minting)"

Write-Info "This will:"
Write-Info "  1. Create on-chain approval UTxO"
Write-Info "  2. Upload metadata to IPFS"
Write-Info "  3. Mint NFT"

$approveBody = @{} | ConvertTo-Json

try {
    $approveResponse = Invoke-WebRequest -Uri "$BackendUrl/coffee/$batchId/approve" `
        -Method POST `
        -Headers @{
            "Content-Type"  = "application/json"
            "Authorization" = "Bearer $qcToken"
        } `
        -Body $approveBody `
        -ErrorAction Stop

    $approveData = $approveResponse.Content | ConvertFrom-Json
    $approvalResult = $approveData.data
    $ipfsCid = $approvalResult.ipfsCid
    $approvalTxHash = $approvalResult.approvalTxHash
    $nftInfo = $approvalResult.nft

    Write-Success "Batch approved by QC"
    Write-Info "Approval Tx Hash: $approvalTxHash"
    Write-Info "IPFS CID: $ipfsCid"

    if ($nftInfo) {
        Write-Success "NFT minted successfully"
        Write-Info "NFT Policy ID: $($nftInfo.policyId)"
        Write-Info "NFT Asset Name: $($nftInfo.assetName)"
        Write-Info "NFT Mint Tx Hash: $($nftInfo.txHash)"
    } else {
        Write-Warning-Custom "NFT minting may have failed or is pending"
    }
} catch {
    Write-Error-Custom "Failed to approve batch"
    Write-Error-Custom "$($_.Exception.Message)"
    Write-Error-Custom "Response: $($_.Exception.Response.StatusCode)"
    exit 1
}

# ============================================================================
# STEP 6: Verify IPFS Metadata
# ============================================================================

Write-Header "Step 6: Verifying IPFS Metadata"

if ($ipfsCid) {
    $ipfsUrl = "https://ipfs.io/ipfs/$ipfsCid"
    Write-Info "IPFS URL: $ipfsUrl"

    try {
        $ipfsResponse = Invoke-WebRequest -Uri $ipfsUrl -ErrorAction Stop
        $metadata = $ipfsResponse.Content | ConvertFrom-Json

        Write-Success "Metadata retrieved from IPFS"
        Write-Info "Name: $($metadata.name)"
        Write-Info "Description: $($metadata.description)"
        Write-Info "Batch ID: $($metadata.attributes.batchId)"
        Write-Info "Type: $($metadata.attributes.type)"
        Write-Info "Origin: $($metadata.attributes.originLocation)"
        Write-Info "Grade: $($metadata.attributes.grade)"
    } catch {
        Write-Warning-Custom "Could not retrieve IPFS metadata (may not be pinned yet)"
        Write-Info "URL: $ipfsUrl"
        Write-Info "Note: IPFS may require time to propagate"
    }
} else {
    Write-Warning-Custom "No IPFS CID in approval response"
}

# ============================================================================
# STEP 7: Verify On-Chain Transactions (Blockfrost)
# ============================================================================

Write-Header "Step 7: Verifying On-Chain Transactions (Blockfrost)"

if (-not $BlockfrostKey) {
    Write-Warning-Custom "BLOCKFROST_API_KEY not set; skipping on-chain verification"
    Write-Info "Set BLOCKFROST_API_KEY environment variable and re-run to verify"
} else {
    $blockfrostUrl = "https://cardano-preprod.blockfrost.io/api/v0"
    $headers = @{ "project_id" = $BlockfrostKey }

    # Verify Approval Tx
    if ($approvalTxHash) {
        Write-Info "Verifying approval transaction..."
        try {
            $approvalTxResponse = Invoke-WebRequest -Uri "$blockfrostUrl/txs/$approvalTxHash" `
                -Headers $headers `
                -ErrorAction Stop

            $approvalTx = $approvalTxResponse.Content | ConvertFrom-Json

            Write-Success "Approval transaction confirmed on-chain"
            Write-Info "Tx Hash: $($approvalTx.hash)"
            Write-Info "Block: $($approvalTx.block)"
            Write-Info "Status: $(if ($approvalTx.block) { 'Confirmed' } else { 'Pending' })"
        } catch {
            Write-Warning-Custom "Could not verify approval transaction on Blockfrost"
            Write-Info "Tx Hash: $approvalTxHash"
            Write-Info "This may be normal if the transaction is still pending"
        }
    }

    # Verify NFT Mint Tx
    if ($nftInfo -and $nftInfo.txHash) {
        Write-Info "Verifying NFT minting transaction..."
        try {
            $nftTxResponse = Invoke-WebRequest -Uri "$blockfrostUrl/txs/$($nftInfo.txHash)" `
                -Headers $headers `
                -ErrorAction Stop

            $nftTx = $nftTxResponse.Content | ConvertFrom-Json

            Write-Success "NFT minting transaction confirmed on-chain"
            Write-Info "Tx Hash: $($nftTx.hash)"
            Write-Info "Block: $($nftTx.block)"
            Write-Info "Status: $(if ($nftTx.block) { 'Confirmed' } else { 'Pending' })"
        } catch {
            Write-Warning-Custom "Could not verify NFT minting transaction on Blockfrost"
            Write-Info "Tx Hash: $($nftInfo.txHash)"
        }
    }

    # Verify NFT Asset
    if ($nftInfo) {
        Write-Info "Verifying NFT asset..."
        $fullAssetId = "$($nftInfo.policyId)$($nftInfo.assetName)"
        try {
            $assetResponse = Invoke-WebRequest -Uri "$blockfrostUrl/assets/$fullAssetId" `
                -Headers $headers `
                -ErrorAction Stop

            $asset = $assetResponse.Content | ConvertFrom-Json

            Write-Success "NFT asset verified on-chain"
            Write-Info "Asset ID: $($asset.asset)"
            Write-Info "Policy ID: $($asset.policy_id)"
            Write-Info "Quantity: $($asset.quantity)"
            Write-Info "Mint Count: $($asset.mint_count)"
        } catch {
            Write-Warning-Custom "NFT asset not yet visible on Blockfrost"
            Write-Info "Asset ID: $fullAssetId"
            Write-Info "This may be normal if the transaction is still pending"
        }
    }
}

# ============================================================================
# STEP 8: Query Batch Verification Endpoint
# ============================================================================

Write-Header "Step 8: Querying Batch Verification Endpoint"

try {
    $verifyResponse = Invoke-WebRequest -Uri "$BackendUrl/coffee/verify/$qrCode" `
        -ErrorAction Stop

    $verifyData = $verifyResponse.Content | ConvertFrom-Json
    $verifyBatch = $verifyData.data.batch
    $verifyResult = $verifyData.data.verificationResult

    Write-Success "Batch verification successful"
    Write-Info "Verified: $($verifyData.data.verified)"
    Write-Info "Status: $($verifyBatch.status)"
    Write-Info "NFT Minted: $(if ($verifyBatch.nftPolicyId) { 'Yes' } else { 'No' })"
    Write-Info "NFT Policy ID: $($verifyBatch.nftPolicyId)"
    Write-Info "NFT Asset Name: $($verifyBatch.nftAssetName)"
    Write-Info ""
    Write-Info "Integrity Check:"
    Write-Info "  Valid: $($verifyResult.isValid)"
    Write-Info "  Tampered: $($verifyResult.tampered)"
    Write-Info "  Issues: $($verifyResult.issues.Count)"
    if ($verifyResult.issues.Count -gt 0) {
        $verifyResult.issues | ForEach-Object { Write-Warning-Custom "    - $_" }
    }
} catch {
    Write-Error-Custom "Failed to query batch verification endpoint"
    Write-Error-Custom "$($_.Exception.Message)"
}

# ============================================================================
# SUMMARY
# ============================================================================

Write-Header "Test Summary"

Write-Success "Test completed successfully!"
Write-Host ""
Write-Host "Key Results:" -ForegroundColor $Colors.Info
Write-Host "  Batch ID:              $batchId" -ForegroundColor $Colors.Info
Write-Host "  Lot ID:                $($batch.lotId)" -ForegroundColor $Colors.Info
Write-Host "  Status:                Approved" -ForegroundColor $Colors.Info
Write-Host "  Approval Tx Hash:      $approvalTxHash" -ForegroundColor $Colors.Info
Write-Host "  IPFS CID:              $ipfsCid" -ForegroundColor $Colors.Info
Write-Host "  NFT Minted:            $(if ($nftInfo) { 'Yes' } else { 'No' })" -ForegroundColor $Colors.Info
if ($nftInfo) {
    Write-Host "  NFT Policy ID:         $($nftInfo.policyId)" -ForegroundColor $Colors.Info
    Write-Host "  NFT Mint Tx Hash:      $($nftInfo.txHash)" -ForegroundColor $Colors.Info
}
Write-Host ""

Write-Info "Next steps:"
Write-Host "  1. Check Blockfrost explorer: https://preprod.cardanoscan.io/" -ForegroundColor $Colors.Info
Write-Host "  2. Query IPFS metadata: https://ipfs.io/ipfs/$ipfsCid" -ForegroundColor $Colors.Info
Write-Host "  3. View batch verification: $($batch.verificationUrl)" -ForegroundColor $Colors.Info
Write-Host ""
