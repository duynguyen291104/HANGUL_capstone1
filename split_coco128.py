"""
Script to split COCO128 dataset into train/val sets.
This creates proper train/val separation for better model evaluation.
"""

import random
import shutil
from pathlib import Path

# Configuration
SRC = Path("coco128")                 # Original COCO128 folder
img_src = SRC / "images" / "train2017"
lab_src = SRC / "labels" / "train2017"

DST = Path("coco128_split")           # New split dataset
train_img = DST / "images" / "train"
val_img   = DST / "images" / "val"
train_lab = DST / "labels" / "train"
val_lab   = DST / "labels" / "val"

# Create directories
for p in [train_img, val_img, train_lab, val_lab]:
    p.mkdir(parents=True, exist_ok=True)

print("=" * 60)
print("COCO128 Train/Val Split Script")
print("=" * 60)

# Get all images
imgs = sorted([p for p in img_src.iterdir() if p.suffix.lower() in [".jpg", ".jpeg", ".png"]])
print(f"\nFound {len(imgs)} images in {img_src}")

# Shuffle with fixed seed for reproducibility
random.seed(42)
random.shuffle(imgs)

# Split: 20% for validation, minimum 10 images
val_n = max(10, int(0.2 * len(imgs)))
val_set = imgs[:val_n]
train_set = imgs[val_n:]

print(f"\nSplitting:")
print(f"  Train: {len(train_set)} images")
print(f"  Val:   {len(val_set)} images")

def copy_pair(img_path, out_img_dir, out_lab_dir):
    """Copy image and corresponding label file"""
    # Copy image
    shutil.copy2(img_path, out_img_dir / img_path.name)
    
    # Copy label if exists, create empty file if not
    lab_path = lab_src / (img_path.stem + ".txt")
    if lab_path.exists():
        shutil.copy2(lab_path, out_lab_dir / lab_path.name)
    else:
        # No objects in image, create empty label file
        (out_lab_dir / (img_path.stem + ".txt")).write_text("")

# Copy train set
print("\nCopying train set...")
for img in train_set:
    copy_pair(img, train_img, train_lab)

# Copy validation set
print("Copying validation set...")
for img in val_set:
    copy_pair(img, val_img, val_lab)

print("\n✅ Done!")
print(f"\nDataset saved to: {DST}")
print(f"  Train images: {train_img}")
print(f"  Train labels: {train_lab}")
print(f"  Val images:   {val_img}")
print(f"  Val labels:   {val_lab}")

# Verify
train_imgs_count = len(list(train_img.iterdir()))
train_labs_count = len(list(train_lab.iterdir()))
val_imgs_count = len(list(val_img.iterdir()))
val_labs_count = len(list(val_lab.iterdir()))

print(f"\nVerification:")
print(f"  Train: {train_imgs_count} images, {train_labs_count} labels")
print(f"  Val:   {val_imgs_count} images, {val_labs_count} labels")

print(f"\n📝 Next step: Use 'coco128_split.yaml' for training")
