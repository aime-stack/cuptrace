#!/bin/bash

# Test script to add batch history for testing the journey visualization
# This simulates a batch moving through the supply chain

BATCH_ID="cmj1kbgr9000123guq3gnbagd"  # Replace with your batch ID

echo "=========================================
Adding Test Stage History to Batch
=========================================
"

# Get authentication token
echo "Step 1: Login to get token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"agent.huye@cuptrace.rw",
    "password":"agent123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo "❌ Failed to login. Check credentials."
    exit 1
fi

echo "✅ Logged in successfully"
echo ""

# Stage 1: Move to Washing Station
echo "Step 2: Moving batch to Washing Station..."
curl -s -X PUT "http://localhost:3001/stage/coffee/${BATCH_ID}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "washing_station",
    "notes": "Batch received at Huye Washing Station. Quality inspection passed.",
    "location": "Huye Washing Station, Southern Province",
    "quantity": 100,
    "quality": "Premium Grade A"
  }' | jq

echo "✅ Moved to Washing Station"
echo ""
sleep 2

# Stage 2: Move to Factory
echo "Step 3: Moving batch to Factory..."
curl -s -X PUT "http://localhost:3001/stage/coffee/${BATCH_ID}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "factory",
    "notes": "Processing completed. Batch roasted and packaged.",
    "location": "Kigali Coffee Factory",
    "quantity": 98,
    "quality": "Premium Grade A - Fully Washed"
  }' | jq

echo "✅ Moved to Factory"
echo ""
sleep 2

# Stage 3: Move to Exporter
echo "Step 4: Moving batch to Exporter..."
curl -s -X PUT "http://localhost:3001/stage/coffee/${BATCH_ID}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "exporter",
    "notes": "Ready for international shipment. All export documentation completed.",
    "location": "Rwanda Coffee Exports Ltd, Kigali",
    "quantity": 98,
    "quality": "Premium Grade A - Export Ready"
  }' | jq

echo "✅ Moved to Exporter"
echo ""

echo "=========================================
✅ Test History Created Successfully!
=========================================
"
echo ""
echo "Now refresh your browser to see the journey timeline!"
echo "Go to: http://localhost:3000/farmer/batches/${BATCH_ID}"
echo ""
