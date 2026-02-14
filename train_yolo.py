"""
YOLO Training Script for Real-time Object Detection
This script trains a YOLO model on the COCO80 dataset for Korean vocabulary learning.
"""

import os
from pathlib import Path
import torch

# Fix PyTorch 2.6 weights_only issue - patch torch.load
_original_torch_load = torch.load
def _patched_torch_load(*args, **kwargs):
    kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)
torch.load = _patched_torch_load

from ultralytics import YOLO

def train_yolo():
    """Train YOLO model on COCO80 dataset"""
    
    print("=" * 60)
    print("YOLO Training Script - Korean Vocab Learning")
    print("=" * 60)
    
    # Configuration
    model_name = 'yolo11n.pt'  # or 'yolov8n.pt' for YOLOv8
    data_yaml = 'coco80.yaml'
    epochs = 20
    imgsz = 640
    batch_size = 16
    
    print(f"\nConfiguration:")
    print(f"  Model: {model_name}")
    print(f"  Data: {data_yaml}")
    print(f"  Epochs: {epochs}")
    print(f"  Image Size: {imgsz}")
    print(f"  Batch Size: {batch_size}")
    
    # Check if dataset exists
    data_path = Path(data_yaml)
    if not data_path.exists():
        print(f"\n❌ Error: {data_yaml} not found!")
        print("Please run create_coco80.py first to create the dataset.")
        return
    
    # Load model
    print("\n📦 Loading model...")
    model = YOLO(model_name)
    
    # Train
    print("\n🚀 Starting training...")
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch_size,
        name='korean-vocab-detector',
        patience=50,  # Early stopping
        save=True,
        device='cpu',  # Change to 'cuda' or 'mps' if GPU available
        # Augmentation settings
        hsv_h=0.015,  # Image HSV-Hue augmentation
        hsv_s=0.7,    # Image HSV-Saturation augmentation
        hsv_v=0.4,    # Image HSV-Value augmentation
        degrees=0.0,  # Image rotation
        translate=0.1,  # Image translation
        scale=0.5,    # Image scale
        flipud=0.0,   # Image flip up-down
        fliplr=0.5,   # Image flip left-right
        mosaic=1.0,   # Image mosaic
    )
    
    print("\n✅ Training completed!")
    print(f"\nResults saved to: runs/detect/korean-vocab-detector")
    print(f"Best model: runs/detect/korean-vocab-detector/weights/best.pt")
    
    # Validate
    print("\n📊 Running validation...")
    metrics = model.val()
    print(f"\nmAP50: {metrics.box.map50:.3f}")
    print(f"mAP50-95: {metrics.box.map:.3f}")
    
    return results

def export_model(model_path='runs/detect/korean-vocab-detector/weights/best.pt'):
    """Export trained model to different formats"""
    
    print("\n" + "=" * 60)
    print("Exporting Model")
    print("=" * 60)
    
    model = YOLO(model_path)
    
    # Export to ONNX (for cross-platform inference)
    print("\n📤 Exporting to ONNX...")
    model.export(format='onnx')
    print("✅ ONNX export complete!")
    
    # Optionally export to other formats
    # model.export(format='tflite')  # For mobile
    # model.export(format='torchscript')  # For production
    
    print(f"\nExported models saved in: {Path(model_path).parent}")

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Train YOLO for Korean Vocab Detection')
    parser.add_argument('--train', action='store_true', help='Train the model')
    parser.add_argument('--export', action='store_true', help='Export trained model')
    parser.add_argument('--model', type=str, default='runs/detect/korean-vocab-detector/weights/best.pt',
                        help='Path to model for export')
    
    args = parser.parse_args()
    
    if args.train:
        train_yolo()
    
    if args.export:
        export_model(args.model)
    
    if not args.train and not args.export:
        print("Usage:")
        print("  Train: python train_yolo.py --train")
        print("  Export: python train_yolo.py --export")
        print("  Both: python train_yolo.py --train --export")
