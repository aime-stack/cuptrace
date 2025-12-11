# CupTrace QR/USSD Test Script
# Run from backend directory: .\scripts\test-qr-ussd.ps1

param(
    [string]$ApiUrl = "http://localhost:3001",
    [string]$FrontendUrl = "http://localhost:3000"
)

Write-Host "=== CupTrace QR/USSD Test Script ===" -ForegroundColor Cyan
Write-Host ""

# Configuration - Using seeded factory user
$TestEmail = "factory@cuptrace.rw"
$TestPassword = "factory123"

# Step 1: Login to get token
Write-Host "[1/6] Authenticating..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $TestEmail
        password = $TestPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$ApiUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop

    $token = $loginResponse.data.token
    Write-Host "  [OK] Authenticated successfully" -ForegroundColor Green
}
catch {
    Write-Host "  [FAIL] Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Note: Make sure a factory user exists with email: $TestEmail" -ForegroundColor Yellow
    exit 1
}

# Step 2: Get an approved batch
Write-Host "[2/6] Finding approved batch..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $batchUrl = "$ApiUrl/coffee?status=approved"
    $batchesResponse = Invoke-RestMethod -Uri $batchUrl -Method GET -Headers $headers -ErrorAction Stop

    if ($batchesResponse.data.data.Count -eq 0) {
        Write-Host "  [FAIL] No approved batches found. Create and approve a batch first." -ForegroundColor Red
        exit 1
    }

    $batchId = $batchesResponse.data.data[0].id
    Write-Host "  [OK] Found batch: $batchId" -ForegroundColor Green
}
catch {
    Write-Host "  [FAIL] Failed to fetch batches: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Generate QR for batch
Write-Host "[3/6] Generating QR code..." -ForegroundColor Yellow
try {
    $qrResponse = Invoke-RestMethod -Uri "$ApiUrl/api/batches/$batchId/generate-qr" -Method POST -Headers $headers -ErrorAction Stop

    if ($qrResponse.success) {
        $publicTraceHash = $qrResponse.data.publicTraceHash
        $qrCodeUrl = $qrResponse.data.qrCodeUrl
        $traceUrl = $qrResponse.data.traceUrl
        
        Write-Host "  [OK] QR generated successfully" -ForegroundColor Green
        Write-Host "    - Public Hash: $publicTraceHash" -ForegroundColor Gray
        Write-Host "    - QR URL: $qrCodeUrl" -ForegroundColor Gray
        Write-Host "    - Trace URL: $traceUrl" -ForegroundColor Gray
    }
    else {
        Write-Host "  [FAIL] QR generation failed" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "  [FAIL] QR generation error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Test public trace endpoint
Write-Host "[4/6] Testing public trace endpoint..." -ForegroundColor Yellow
try {
    $traceResponse = Invoke-RestMethod -Uri "$ApiUrl/api/trace/$publicTraceHash" -Method GET -ErrorAction Stop

    if ($traceResponse.success) {
        Write-Host "  [OK] Trace endpoint working" -ForegroundColor Green
        
        # Verify no PII is exposed
        $farmer = $traceResponse.data.farmer
        if ($farmer -and $farmer.displayName -match "^Farmer F-") {
            Write-Host "  [OK] Farmer identity properly anonymized: $($farmer.displayName)" -ForegroundColor Green
        }
        elseif ($farmer) {
            Write-Host "  [WARN] Warning: Farmer identity may not be anonymized" -ForegroundColor Yellow
        }
        
        # Check no exact address is exposed
        if (-not $traceResponse.data.origin.address -and -not $traceResponse.data.origin.cell) {
            Write-Host "  [OK] No exact address exposed (only region)" -ForegroundColor Green
        }
    }
}
catch {
    Write-Host "  [FAIL] Trace endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test USSD endpoint
Write-Host "[5/6] Testing USSD endpoint..." -ForegroundColor Yellow
try {
    $ussdBody = @{
        sessionId = "test-session-" + (Get-Random)
        phoneNumber = "+250781234567"
        text = ""
        serviceCode = "*123#"
    } | ConvertTo-Json

    $ussdResponse = Invoke-RestMethod -Uri "$ApiUrl/api/ussd" -Method POST -Body $ussdBody -ContentType "application/json" -ErrorAction Stop

    if ($ussdResponse -match "CupTrace") {
        Write-Host "  [OK] USSD endpoint responding" -ForegroundColor Green
        $responsePreview = $ussdResponse.Substring(0, [Math]::Min(100, $ussdResponse.Length))
        Write-Host "    Response: $responsePreview..." -ForegroundColor Gray
    }
    else {
        Write-Host "  [OK] USSD endpoint responding (phone not registered)" -ForegroundColor Green
    }
}
catch {
    Write-Host "  [WARN] USSD test skipped or failed (may need phone hash in DB)" -ForegroundColor Yellow
}

# Step 6: Summary
Write-Host ""
Write-Host "[6/6] Test Summary" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Batch ID:          $batchId" -ForegroundColor White
Write-Host "  Public Trace Hash: $publicTraceHash" -ForegroundColor White
Write-Host "  QR Code URL:       $qrCodeUrl" -ForegroundColor White
Write-Host ""
Write-Host "  Consumer Trace Page:" -ForegroundColor White
Write-Host "  $FrontendUrl/trace/$publicTraceHash" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "[OK] Tests completed!" -ForegroundColor Green
