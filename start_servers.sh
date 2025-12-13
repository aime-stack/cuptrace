#!/bin/bash

echo "Starting CupTrace Application..."
echo ""

# Kill any existing processes
echo "Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null
pkill -f "tsx watch" 2>/dev/null
sleep 2

# Check if ports are free
if lsof -i :3001 > /dev/null 2>&1; then
    echo "Error: Port 3001 is in use. Killing process..."
    kill -9 $(lsof -t -i:3001) 2>/dev/null
    sleep 1
fi

if lsof -i :3000 > /dev/null 2>&1; then
    echo "Error: Port 3000 is in use. Killing process..."
    kill -9 $(lsof -t -i:3000) 2>/dev/null
    sleep 1
fi

echo ""
echo "✓ Ports 3000 and 3001 are now free"
echo ""

# Start backend
echo "Starting backend on port 3001..."
cd /home/umwami/Desktop/cuptrace/backend
npm run dev > /tmp/backend_start.log 2>&1 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Check backend health
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✓ Backend is running on http://localhost:3001"
else
    echo "✗ Backend failed to start. Check /tmp/backend_start.log"
    exit 1
fi

echo ""

# Start frontend
echo "Starting frontend on port 3000..."
cd /home/umwami/Desktop/cuptrace/frontend
npm run dev > /tmp/frontend_start.log 2>&1 &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 5

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Frontend is running on http://localhost:3000"
else
    echo "✗ Frontend failed to start. Check /tmp/frontend_start.log"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ CupTrace Application Started Successfully!"
echo "=========================================="
echo ""
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "You can now access the application at:"
echo "  http://localhost:3000/login"
echo ""
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the servers, run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
