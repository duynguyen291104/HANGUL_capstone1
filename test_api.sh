#!/bin/bash

# Test Backend API Script

echo "======================================================================"
echo "🧪 Testing Backend API"
echo "======================================================================"
echo ""

API_URL="http://localhost:5001"

# Check if backend is running
echo "1️⃣ Testing health endpoint..."
HEALTH=$(curl -s "$API_URL/health" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Backend is running"
    echo "$HEALTH" | python3 -m json.tool
else
    echo "❌ Backend is not running!"
    echo ""
    echo "Start backend with:"
    echo "  cd ai-backend && python3 app.py"
    echo ""
    exit 1
fi

echo ""
echo "2️⃣ Testing vocabulary list..."
VOCAB=$(curl -s "$API_URL/vocab/list" 2>/dev/null)
echo "$VOCAB" | python3 -c "import sys, json; data = json.load(sys.stdin); print(f\"Total classes: {data['total']}\"); print('Sample mappings:'); [print(f'  {k} → {v}') for k, v in list(data['mappings'].items())[:10]]"

echo ""
echo "3️⃣ API Endpoints available:"
echo "  GET  $API_URL/health"
echo "  POST $API_URL/detect"
echo "  GET  $API_URL/vocab/list"
echo "  POST $API_URL/vocab/add"

echo ""
echo "======================================================================"
echo "✅ API Test Complete"
echo "======================================================================"
