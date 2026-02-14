"""
Real-time Object Detection with Korean Labels
Uses YOLO model to detect objects from webcam and displays Korean labels with bounding boxes.
Supports cross-platform font loading (Windows, macOS, Linux).
"""

import cv2
import json
import numpy as np
import platform
from pathlib import Path
import torch
import os

# Fix PyTorch 2.6 weights_only issue - patch torch.load
_original_torch_load = torch.load
def _patched_torch_load(*args, **kwargs):
    # Force weights_only=False for compatibility
    kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)
torch.load = _patched_torch_load

from ultralytics import YOLO
from PIL import ImageFont, ImageDraw, Image

print("=" * 60)
print("Real-time Object Detection - Korean Labels")
print("=" * 60)

# ===========================
# 1) Load YOLO Model
# ===========================
MODEL_PATH = "runs/detect/train/weights/best.pt"  # Your trained model
# Fallback to pretrained if custom model not found
if not Path(MODEL_PATH).exists():
    print(f"\n⚠️  Trained model not found at {MODEL_PATH}")
    print("Using pretrained yolov8n.pt instead...")
    MODEL_PATH = "yolov8n.pt"

print(f"\n📦 Loading model: {MODEL_PATH}")
model = YOLO(MODEL_PATH)
print("✅ Model loaded successfully!")

# ===========================
# 2) Load Korean Labels Mapping
# ===========================
LABELS_KO_PATH = "ai-backend/labels_ko.json"
print(f"\n📖 Loading Korean labels from: {LABELS_KO_PATH}")

try:
    with open(LABELS_KO_PATH, "r", encoding="utf-8") as f:
        ko_map = json.load(f)
    print(f"✅ Loaded {len(ko_map)} Korean label mappings")
except FileNotFoundError:
    print(f"⚠️  Korean labels not found, using English labels")
    ko_map = {}

# ===========================
# 3) Setup Korean Font
# ===========================
def get_korean_font(size=28):
    """Auto-detect and load Korean font based on OS"""
    system = platform.system()
    
    font_paths = {
        "Windows": [
            "C:/Windows/Fonts/malgun.ttf",
            "C:/Windows/Fonts/gulim.ttc",
            "C:/Windows/Fonts/batang.ttc",
        ],
        "Darwin": [  # macOS
            "/System/Library/Fonts/AppleSDGothicNeo.ttc",
            "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
            "/Library/Fonts/Arial Unicode.ttf",
        ],
        "Linux": [
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
            "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc",
            "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
            "/usr/share/fonts/truetype/nanum/NanumBarunGothic.ttf",
        ]
    }
    
    # Try system-specific fonts first
    if system in font_paths:
        for font_path in font_paths[system]:
            if Path(font_path).exists():
                print(f"✅ Using font: {font_path}")
                return ImageFont.truetype(font_path, size)
    
    # Fallback to default font
    print("⚠️  No Korean font found, using default font")
    return ImageFont.load_default()

FONT = get_korean_font(size=28)

# ===========================
# 4) Camera Setup
# ===========================
print("\n🎥 Initializing camera...")
cap = cv2.VideoCapture(0)

# Set camera resolution (adjust if needed)
CAMERA_WIDTH = 640
CAMERA_HEIGHT = 480
cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)

if not cap.isOpened():
    print("❌ Error: Cannot open camera")
    exit()

print(f"✅ Camera opened: {CAMERA_WIDTH}x{CAMERA_HEIGHT}")

# ===========================
# 5) Detection Settings
# ===========================
CONF_THRESHOLD = 0.35  # Confidence threshold (0.0 - 1.0)
IMGSZ = 640            # YOLO input size

print(f"\n⚙️  Detection Settings:")
print(f"   Confidence Threshold: {CONF_THRESHOLD}")
print(f"   Image Size: {IMGSZ}")
print(f"\n▶️  Press ESC to quit\n")

# ===========================
# 6) Main Detection Loop
# ===========================
frame_count = 0

try:
    while True:
        ok, frame = cap.read()
        if not ok:
            print("❌ Failed to read frame")
            break
        
        frame_count += 1
        
        # Run YOLO detection
        results = model(frame, imgsz=IMGSZ, verbose=False)[0]
        
        # Convert to PIL for Korean text rendering
        pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(pil_img)
        
        detected_count = 0
        
        # Process each detection
        for box in results.boxes:
            conf = float(box.conf[0])
            if conf < CONF_THRESHOLD:
                continue
            
            detected_count += 1
            
            # Get class info
            cls_id = int(box.cls[0])
            name_en = model.names[cls_id]
            name_ko = ko_map.get(name_en, name_en)  # Fallback to English if no Korean
            
            # Get bounding box coordinates
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            
            # Draw bounding box
            draw.rectangle([x1, y1, x2, y2], outline=(0, 255, 0), width=3)
            
            # Prepare label text
            label = f"{name_ko} {conf:.2f}"
            
            # Calculate text position (above bbox)
            x_text, y_text = x1, max(0, y1 - 35)
            
            # Get text bounding box
            bbox = draw.textbbox((x_text, y_text), label, font=FONT)
            
            # Draw background rectangle for text
            draw.rectangle(bbox, fill=(0, 0, 0))
            
            # Draw text
            draw.text((x_text, y_text), label, font=FONT, fill=(255, 255, 255))
        
        # Convert back to OpenCV format
        out_frame = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        
        # Add info overlay
        info_text = f"Frame: {frame_count} | Objects: {detected_count}"
        cv2.putText(out_frame, info_text, (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Display
        cv2.imshow("COCO128 Real-time Scan (Korean)", out_frame)
        
        # Check for ESC key
        key = cv2.waitKey(1) & 0xFF
        if key == 27:  # ESC
            print("\n👋 Exiting...")
            break
        elif key == ord('s'):  # Save screenshot
            screenshot_path = f"screenshot_{frame_count}.jpg"
            cv2.imwrite(screenshot_path, out_frame)
            print(f"📸 Screenshot saved: {screenshot_path}")

except KeyboardInterrupt:
    print("\n\n⚠️  Interrupted by user")

finally:
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    print("\n✅ Camera released, windows closed")
    print(f"📊 Total frames processed: {frame_count}")
