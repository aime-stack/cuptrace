#!/bin/bash

# Configuration
API_URL="http://localhost:3001"
# Login first to get token
echo "Logging in as Agent Huye..."
LOGIN_RES=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent.huye@cuptrace.rw", "password":"agent123"}')

TOKEN=$(echo $LOGIN_RES | jq -r '.data.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo "Login failed. Response: $LOGIN_RES"
    exit 1
fi
echo "Login successful. Token obtained."

# Test 1: Create Announcement
echo "Creating Announcement..."
CREATE_RES=$(curl -s -X POST $API_URL/community/announcements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome to the Community!",
    "content": "This is a test announcement to verify the system.",
    "type": "general",
    "priority": "normal"
  }')
echo $CREATE_RES | grep "id" && echo "Announcement created." || echo "Failed to create announcement: $CREATE_RES"

# Test 2: List Announcements
echo "Listing Announcements..."
LIST_RES=$(curl -s -X GET $API_URL/community/announcements \
  -H "Authorization: Bearer $TOKEN")
echo $LIST_RES | grep "Welcome" && echo "Announcements listed." || echo "Failed to list announcements: $LIST_RES"

# Test 3: Create Poll
echo "Creating Poll..."
POLL_Res=$(curl -s -X POST $API_URL/community/polls \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Coffee Price Satisfaction",
    "description": "Are you happy with current prices?",
    "pollType": "coffee_price",
    "options": [
        {"id": "yes", "text": "Yes, very happy"},
        {"id": "somewhat", "text": "Somewhat happy"},
        {"id": "no", "text": "No, need increase"}
    ]
  }')

POLL_ID=$(echo $POLL_Res | jq -r '.data.id')

if [ -z "$POLL_ID" ] || [ "$POLL_ID" == "null" ]; then
    echo "Failed to create poll. Response: $POLL_Res"
    # Don't exit, try listing anyway
else 
    echo "Poll created with ID: $POLL_ID"
fi

# Test 4: List Polls
echo "Listing Polls..."
LIST_POLLS=$(curl -s -X GET $API_URL/community/polls \
  -H "Authorization: Bearer $TOKEN")
echo $LIST_POLLS | grep "Coffee Price" && echo "Polls listed." || echo "Failed to list polls."

# Test 5: Vote on Poll (if poll created)
if [ ! -z "$POLL_ID" ] && [ "$POLL_ID" != "null" ]; then
    echo "Voting on Poll..."
    VOTE_RES=$(curl -s -X POST $API_URL/community/polls/$POLL_ID/vote \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"optionId": "yes"}')
    echo $VOTE_RES | grep "id" && echo "Vote submitted." || echo "Vote response: $VOTE_RES"
fi

# Test 6: Get Results
if [ ! -z "$POLL_ID" ] && [ "$POLL_ID" != "null" ]; then
    echo "Getting Poll Results..."
    RESULTS_RES=$(curl -s -X GET $API_URL/community/polls/$POLL_ID/results \
      -H "Authorization: Bearer $TOKEN")
    echo $RESULTS_RES | grep "optionId" && echo "Results retrieved." || echo "Failed to get results: $RESULTS_RES"
fi

echo "Tests completed."
