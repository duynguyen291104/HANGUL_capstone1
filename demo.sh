#!/bin/bash

# Demo Script - Quick test realtime detection
# This script demonstrates the system without requiring webcam

echo "======================================================================"
echo "🎯 Demo Script - Korean Object Detection System"
echo "======================================================================"
echo ""

# Check dependencies
echo "📦 Checking dependencies..."
python3 -c "import cv2, ultralytics, PIL, numpy" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Missing dependencies. Installing..."
    pip install ultralytics opencv-python pillow numpy
fi
echo "✅ Dependencies OK"
echo ""

# Check dataset
echo "📁 Checking dataset..."
if [ -d "coco128_split/images/train" ]; then
    TRAIN_COUNT=$(ls coco128_split/images/train | wc -l)
    VAL_COUNT=$(ls coco128_split/images/val | wc -l)
    echo "✅ Dataset ready: $TRAIN_COUNT train, $VAL_COUNT val"
else
    echo "⚠️  Split dataset not found. Creating..."
    python3 split_coco128.py
fi
echo ""

# Check model
echo "🤖 Checking model..."
if [ -f "runs/detect/train/weights/best.pt" ]; then
    echo "✅ Trained model found: runs/detect/train/weights/best.pt"
    MODEL="runs/detect/train/weights/best.pt"
else
    echo "⚠️  No trained model, will use pretrained yolov8n.pt"
    MODEL="yolov8n.pt"
fi
echo ""

# Check Korean labels
echo "📖 Checking Korean labels..."
if [ -f "ai-backend/labels_ko.json" ]; then
    LABELS_COUNT=$(python3 -c "import json; print(len(json.load(open('ai-backend/labels_ko.json'))))")
    echo "✅ Korean labels ready: $LABELS_COUNT classes"
else
    echo "❌ Korean labels not found!"
    exit 1
fi
echo ""

# Demo options
echo "======================================================================"
echo "🎬 Demo Options:"
echo "======================================================================"
echo ""
echo "1) 🎥 Realtime Webcam Detection"
echo "   - Shows live detection with Korean labels"
echo "   - Controls: ESC=quit, S=screenshot"
echo "   - Command: python3 realtime_ko.py"
echo ""
echo "2) 🖼️  Test on Sample Image"
echo "   - Test detection on static image"
echo "   - Command: python3 train_yolo_coco128.py --test --source IMAGE_PATH"
echo ""
echo "3) 🚀 Backend API Server"
echo "   - Start Flask API for frontend integration"
echo "   - Endpoint: http://localhost:5001"
echo "   - Command: cd ai-backend && python3 app.py"
echo ""
echo "4) 📊 Run Performance Benchmark"
echo "   - Measure FPS and latency"
echo "   - Command: make benchmark"
echo ""
echo "======================================================================"
echo ""

# Ask user
read -p "Choose option (1-4) or 'q' to quit: " choice

case $choice in
    1)
        echo ""
        echo "🎥 Starting realtime webcam detection..."
        echo "Controls: ESC=quit, S=screenshot"
        echo ""
        python3 realtime_ko.py
        ;;
    2)
        read -p "Enter image path: " img_path
        if [ -f "$img_path" ]; then
            echo "Testing on image: $img_path"
            python3 train_yolo_coco128.py --test --source "$img_path"
        else
            echo "❌ Image not found: $img_path"
        fi
        ;;
    3)
        echo ""
        echo "🚀 Starting Flask backend..."
        echo "API: http://localhost:5001"
        echo "Press Ctrl+C to stop"
        echo ""
        cd ai-backend && python3 app.py
        ;;
    4)
        echo ""
        echo "📊 Running performance benchmark..."
        python3 -c "
import cv2
import time

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print('❌ Camera not available')
    exit(1)

print('Measuring FPS (capturing 100 frames)...')
start = time.time()
frames = 0

for _ in range(100):
    ret, frame = cap.read()
    if ret:
        frames += 1

elapsed = time.time() - start
fps = frames / elapsed

cap.release()

print(f'✅ FPS: {fps:.2f}')
print(f'   Latency: {1000/fps:.2f}ms per frame')
print(f'   Total time: {elapsed:.2f}s')
"
        ;;
    q|Q)
        echo "Bye! 👋"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Demo complete!"
