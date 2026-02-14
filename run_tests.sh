#!/bin/bash

# Run all tests to verify system is working

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║  🧪 FULL SYSTEM TEST - Korean Object Detection                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0

# Test 1: Check dependencies
echo "┌─ Test 1: Dependencies"
python3 -c "import cv2, ultralytics, PIL, numpy, flask, torch" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "│  ✅ All dependencies installed"
    ((PASS++))
else
    echo "│  ❌ Missing dependencies"
    ((FAIL++))
fi

# Test 2: Check dataset
echo "├─ Test 2: Dataset"
if [ -d "coco128_split/images/train" ]; then
    TRAIN=$(ls coco128_split/images/train 2>/dev/null | wc -l)
    VAL=$(ls coco128_split/images/val 2>/dev/null | wc -l)
    echo "│  ✅ Dataset split: $TRAIN train, $VAL val"
    ((PASS++))
else
    echo "│  ❌ Dataset not found"
    ((FAIL++))
fi

# Test 3: Korean labels
echo "├─ Test 3: Korean Labels"
if [ -f "ai-backend/labels_ko.json" ]; then
    COUNT=$(python3 -c "import json; print(len(json.load(open('ai-backend/labels_ko.json'))))" 2>/dev/null)
    echo "│  ✅ Korean labels: $COUNT classes"
    ((PASS++))
else
    echo "│  ❌ Korean labels not found"
    ((FAIL++))
fi

# Test 4: YOLO model
echo "├─ Test 4: YOLO Model"
python3 -c "
import torch
_orig = torch.load
torch.load = lambda *a, **k: _orig(*a, **{**k, 'weights_only': False})
from ultralytics import YOLO
m = YOLO('yolov8n.pt')
print('│  ✅ Model loaded: {} classes'.format(len(m.names)))
" 2>/dev/null
if [ $? -eq 0 ]; then
    ((PASS++))
else
    echo "│  ❌ Model failed to load"
    ((FAIL++))
fi

# Test 5: Detection pipeline
echo "├─ Test 5: Detection Pipeline"
python3 -c "
import torch, numpy as np, cv2
_orig = torch.load
torch.load = lambda *a, **k: _orig(*a, **{**k, 'weights_only': False})
from ultralytics import YOLO
m = YOLO('yolov8n.pt')
img = np.zeros((480, 640, 3), dtype=np.uint8)
r = m(img, verbose=False)
print('│  ✅ Detection works')
" 2>/dev/null
if [ $? -eq 0 ]; then
    ((PASS++))
else
    echo "│  ❌ Detection failed"
    ((FAIL++))
fi

# Test 6: Backend imports
echo "├─ Test 6: Backend API"
cd ai-backend && python3 -c "
import sys
sys.path.insert(0, '.')
# Just test imports, don't start server
import flask
from flask import Flask
print('│  ✅ Flask ready')
" 2>/dev/null
if [ $? -eq 0 ]; then
    ((PASS++))
else
    echo "│  ❌ Backend imports failed"
    ((FAIL++))
fi
cd ..

# Test 7: Camera check (optional)
echo "└─ Test 7: Camera (optional)"
python3 -c "
import cv2
cap = cv2.VideoCapture(0)
if cap.isOpened():
    print('   ✅ Camera available')
    cap.release()
else:
    print('   ⚠️  No camera (OK for backend-only mode)')
" 2>/dev/null

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║  📊 TEST RESULTS                                                  ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "   ✅ Passed: $PASS/6"
echo "   ❌ Failed: $FAIL/6"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "   🎉 ALL TESTS PASSED! System is ready!"
    echo ""
    echo "   Next steps:"
    echo "     • Test: python3 test_system.py"
    echo "     • Demo: ./demo.sh"
    echo "     • API:  cd ai-backend && python3 app.py"
    echo ""
    exit 0
else
    echo "   ⚠️  Some tests failed. Please check the errors above."
    echo ""
    exit 1
fi
