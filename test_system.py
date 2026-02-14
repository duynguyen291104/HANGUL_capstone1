#!/usr/bin/env python3
"""
Test script to verify YOLO model loading and Korean labels
Without requiring camera/display
"""

import torch
import json
from pathlib import Path

# Fix PyTorch 2.6 weights_only issue
_original_torch_load = torch.load
def _patched_torch_load(*args, **kwargs):
    kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)
torch.load = _patched_torch_load

from ultralytics import YOLO

print("=" * 70)
print("🧪 System Test - Korean Object Detection")
print("=" * 70)
print()

# Test 1: Load Korean labels
print("1️⃣ Testing Korean labels...")
try:
    with open("ai-backend/labels_ko.json", "r", encoding="utf-8") as f:
        labels_ko = json.load(f)
    print(f"   ✅ Loaded {len(labels_ko)} Korean labels")
    print(f"   Sample: cup → {labels_ko.get('cup', 'N/A')}")
    print(f"   Sample: laptop → {labels_ko.get('laptop', 'N/A')}")
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

print()

# Test 2: Load YOLO model
print("2️⃣ Testing YOLO model loading...")
try:
    model_path = "runs/detect/train/weights/best.pt"
    if not Path(model_path).exists():
        print(f"   ℹ️  Trained model not found, using pretrained yolov8n.pt")
        model_path = "yolov8n.pt"
    
    model = YOLO(model_path)
    print(f"   ✅ Model loaded: {model_path}")
    print(f"   Classes: {len(model.names)}")
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

print()

# Test 3: Check if classes match
print("3️⃣ Checking label coverage...")
matched = 0
for cls_name in list(model.names.values())[:10]:  # Check first 10
    if cls_name in labels_ko:
        matched += 1
        print(f"   ✅ {cls_name} → {labels_ko[cls_name]}")
    else:
        print(f"   ⚠️  {cls_name} → (no Korean label)")

print()
print(f"   Coverage: {matched}/10 classes have Korean labels")

print()

# Test 4: Simulate detection
print("4️⃣ Testing detection pipeline (without camera)...")
try:
    import cv2
    import numpy as np
    
    # Create dummy image (640x480 black)
    dummy_img = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Run detection
    results = model(dummy_img, verbose=False)[0]
    print(f"   ✅ Detection pipeline works")
    print(f"   Detected objects: {len(results.boxes)}")
    
except Exception as e:
    print(f"   ❌ Error: {e}")

print()
print("=" * 70)
print("✅ System Test Complete!")
print("=" * 70)
print()
print("Next steps:")
print("  • Run full demo: ./demo.sh")
print("  • Realtime detection: python3 realtime_ko.py")
print("  • Train model: make train")
print()
