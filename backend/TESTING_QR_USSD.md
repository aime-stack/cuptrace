# QR Code Generation, Consumer Trace & USSD Testing Guide

This guide covers testing the QR code generation, consumer trace page, and USSD functionality.

## Prerequisites

1. **Database Migration**: Run the SQL migration in your Supabase dashboard:
   - Open `backend/migrations/0001_add_qr_and_public_hash_up.sql`
   - Execute in Supabase SQL Editor

2. **Environment Variables**: Add to `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   SUPABASE_QR_BUCKET=qr-codes
   FARMER_HASH_SALT=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   PHONE_HASH_SALT=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   FRONTEND_HOST=http://localhost:3000
   USSD_PROVIDER=at
   AT_USERNAME=sandbox
   AT_API_KEY=your-api-key
   ```

3. **Supabase Storage Bucket**: Create a bucket named `qr-codes` in Supabase Storage with public access.

## Quick Test Steps

### 1. Start Backend & Frontend

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Test QR Generation API

```powershell
# Get auth token (login as factory or admin)
$token = "your-jwt-token"

# Generate QR for a batch
Invoke-RestMethod -Uri "http://localhost:3001/api/batches/BATCH_ID/generate-qr" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $token" }
```

### 3. Test Public Trace API

```powershell
# No auth required
Invoke-RestMethod -Uri "http://localhost:3001/api/trace/B-abc123def456" -Method GET
```

### 4. Test Consumer Trace Page

Navigate to: `http://localhost:3000/trace/B-abc123def456`

### 5. Test QR Scanner

1. Go to `http://localhost:3000`
2. Click "Scan QR Code" button
3. Allow camera access
4. Scan a generated QR code OR use "Enter Code Manually"

### 6. Test USSD (Simulation)

```powershell
# Simulate Africa's Talking USSD request
$body = @{
  sessionId = "test-session-123"
  phoneNumber = "+250781234567"
  text = ""
  serviceCode = "*123#"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/ussd" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

## Verification Checklist

- [ ] QR code generated and uploaded to Supabase Storage
- [ ] Public trace endpoint returns data without PII
- [ ] Farmer shown as "Farmer F-XXXX" (not real name)
- [ ] Location shows region only (not exact address)
- [ ] QR scanner opens camera and redirects on scan
- [ ] USSD returns valid menu response

## Rollback

To undo database changes:
```sql
-- Run in Supabase SQL Editor
-- See: backend/migrations/0001_add_qr_and_public_hash_down.sql
```
