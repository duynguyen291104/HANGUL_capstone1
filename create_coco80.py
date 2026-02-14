"""
Script to extract 80 images from COCO128 dataset while preserving labels.
Creates a smaller dataset for faster training and testing.
"""

import os
import random
import shutil
from pathlib import Path

# Configuration
SRC = Path("coco128")                 # COCO128 folder after unzip
SPLIT = "train2017"                   # COCO128 uses train2017
N = 80                                # Number of images to extract
DST = Path("coco80")                  # New dataset folder

# Source directories
img_dir = SRC / "images" / SPLIT
lab_dir = SRC / "labels" / SPLIT

# Destination directories
out_img = DST / "images" / "train"
out_lab = DST / "labels" / "train"
out_img.mkdir(parents=True, exist_ok=True)
out_lab.mkdir(parents=True, exist_ok=True)

# Get all images
imgs = sorted([p for p in img_dir.iterdir() if p.suffix.lower() in [".jpg", ".jpeg", ".png"]])

print(f"Found {len(imgs)} images in {img_dir}")

# Randomly select N images
random.seed(42)  # For reproducibility
chosen = random.sample(imgs, min(N, len(imgs)))

print(f"Selecting {len(chosen)} images...")

# Copy images and labels
copied_count = 0
for img in chosen:
    label = lab_dir / (img.stem + ".txt")
    
    # Copy image
    shutil.copy2(img, out_img / img.name)
    
    # Copy label if exists, create empty file if not
    if label.exists():
        shutil.copy2(label, out_lab / label.name)
    else:
        # If image has no objects, label file might not exist; create empty file
        (out_lab / (img.stem + ".txt")).write_text("")
    
    copied_count += 1

print(f"\n✅ Done: {copied_count} images → {DST}")
print(f"   Images: {out_img}")
print(f"   Labels: {out_lab}")

# Verify
final_imgs = list(out_img.iterdir())
final_labs = list(out_lab.iterdir())
print(f"\nVerification:")
print(f"   Images copied: {len(final_imgs)}")
print(f"   Labels copied: {len(final_labs)}")
