"""
Enhanced YOLO Training Script for COCO128 Dataset
Supports both coco80 and coco128_split configurations.
"""

import os
import argparse
from pathlib import Path
import torch

# Fix PyTorch 2.6 weights_only issue - patch torch.load
_original_torch_load = torch.load
def _patched_torch_load(*args, **kwargs):
    kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)
torch.load = _patched_torch_load

from ultralytics import YOLO

def train_yolo(data_yaml='coco128_split.yaml', model_name='yolo11n.pt', epochs=30):
    """Train YOLO model on specified dataset"""
    
    print("=" * 70)
    print("YOLO Training Script - Korean Vocabulary Object Detection")
    print("=" * 70)
    
    # Configuration
    imgsz = 640
    batch_size = 16
    
    print(f"\n📋 Configuration:")
    print(f"   Model: {model_name}")
    print(f"   Data: {data_yaml}")
    print(f"   Epochs: {epochs}")
    print(f"   Image Size: {imgsz}")
    print(f"   Batch Size: {batch_size}")
    
    # Check if dataset config exists
    data_path = Path(data_yaml)
    if not data_path.exists():
        print(f"\n❌ Error: {data_yaml} not found!")
        print("\nAvailable configs:")
        print("   - coco128_split.yaml (recommended - with train/val split)")
        print("   - coco80.yaml (80 images subset)")
        print("\nPlease run the appropriate setup script first:")
        print("   - For coco128_split: python split_coco128.py")
        print("   - For coco80: python create_coco80.py")
        return None
    
    # Load model
    print(f"\n📦 Loading model: {model_name}")
    model = YOLO(model_name)
    print("✅ Model loaded successfully!")
    
    # Determine device
    import torch
    if torch.cuda.is_available():
        device = 'cuda'
        print(f"🚀 Using GPU: {torch.cuda.get_device_name(0)}")
    elif torch.backends.mps.is_available():
        device = 'mps'
        print("🚀 Using Apple Silicon GPU (MPS)")
    else:
        device = 'cpu'
        print("💻 Using CPU (training will be slower)")
    
    # Train
    print(f"\n🎯 Starting training with {epochs} epochs...")
    print("=" * 70)
    
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch_size,
        name='train',
        patience=50,          # Early stopping patience
        save=True,            # Save checkpoints
        device=device,
        
        # Optimization
        optimizer='auto',     # Auto-select optimizer
        lr0=0.01,            # Initial learning rate
        lrf=0.01,            # Final learning rate
        momentum=0.937,      # SGD momentum
        weight_decay=0.0005, # Optimizer weight decay
        
        # Augmentation settings
        hsv_h=0.015,         # HSV-Hue augmentation
        hsv_s=0.7,           # HSV-Saturation augmentation
        hsv_v=0.4,           # HSV-Value augmentation
        degrees=0.0,         # Image rotation (+/- deg)
        translate=0.1,       # Image translation (+/- fraction)
        scale=0.5,           # Image scale (+/- gain)
        shear=0.0,           # Image shear (+/- deg)
        perspective=0.0,     # Image perspective (+/- fraction)
        flipud=0.0,          # Image flip up-down (probability)
        fliplr=0.5,          # Image flip left-right (probability)
        mosaic=1.0,          # Image mosaic (probability)
        mixup=0.0,           # Image mixup (probability)
        copy_paste=0.0,      # Segment copy-paste (probability)
        
        # Logging
        verbose=True,        # Verbose output
        plots=True,          # Save plots
    )
    
    print("\n" + "=" * 70)
    print("✅ Training completed!")
    print("=" * 70)
    print(f"\n📁 Results saved to: runs/detect/train")
    print(f"📦 Best model: runs/detect/train/weights/best.pt")
    print(f"📦 Last model: runs/detect/train/weights/last.pt")
    
    # Validate
    print("\n📊 Running validation on best model...")
    best_model = YOLO('runs/detect/train/weights/best.pt')
    metrics = best_model.val()
    
    print(f"\n📈 Validation Results:")
    print(f"   mAP50: {metrics.box.map50:.4f}")
    print(f"   mAP50-95: {metrics.box.map:.4f}")
    print(f"   Precision: {metrics.box.mp:.4f}")
    print(f"   Recall: {metrics.box.mr:.4f}")
    
    return results

def export_model(model_path='runs/detect/train/weights/best.pt', formats=None):
    """Export trained model to different formats"""
    
    if formats is None:
        formats = ['onnx']  # Default to ONNX
    
    print("\n" + "=" * 70)
    print("Model Export")
    print("=" * 70)
    
    model_path = Path(model_path)
    if not model_path.exists():
        print(f"❌ Error: Model not found at {model_path}")
        print("Please train the model first: python train_yolo_coco128.py --train")
        return
    
    print(f"\n📦 Loading model: {model_path}")
    model = YOLO(model_path)
    
    for fmt in formats:
        print(f"\n📤 Exporting to {fmt.upper()}...")
        try:
            model.export(format=fmt)
            print(f"✅ {fmt.upper()} export complete!")
        except Exception as e:
            print(f"❌ {fmt.upper()} export failed: {e}")
    
    print(f"\n📁 Exported models saved in: {model_path.parent}")

def test_model(model_path='runs/detect/train/weights/best.pt', source='0'):
    """Test model on webcam or image"""
    
    print("\n" + "=" * 70)
    print("Model Testing")
    print("=" * 70)
    
    model_path = Path(model_path)
    if not model_path.exists():
        print(f"❌ Error: Model not found at {model_path}")
        return
    
    print(f"\n📦 Loading model: {model_path}")
    model = YOLO(model_path)
    
    print(f"🎥 Running inference on source: {source}")
    print("   (Press 'q' to quit)")
    
    # Run prediction
    results = model.predict(
        source=source,
        conf=0.35,
        save=True,
        show=True,
    )
    
    print("\n✅ Testing complete!")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train YOLO for Korean Object Detection')
    
    # Training arguments
    parser.add_argument('--train', action='store_true', 
                        help='Train the model')
    parser.add_argument('--data', type=str, default='coco128_split.yaml',
                        help='Dataset YAML file (default: coco128_split.yaml)')
    parser.add_argument('--model', type=str, default='yolo11n.pt',
                        help='Model to use (default: yolo11n.pt)')
    parser.add_argument('--epochs', type=int, default=30,
                        help='Number of epochs (default: 30)')
    
    # Export arguments
    parser.add_argument('--export', action='store_true',
                        help='Export trained model')
    parser.add_argument('--export-path', type=str, 
                        default='runs/detect/train/weights/best.pt',
                        help='Path to model for export')
    parser.add_argument('--formats', nargs='+', default=['onnx'],
                        help='Export formats (default: onnx)')
    
    # Testing arguments
    parser.add_argument('--test', action='store_true',
                        help='Test model on webcam')
    parser.add_argument('--test-path', type=str,
                        default='runs/detect/train/weights/best.pt',
                        help='Path to model for testing')
    parser.add_argument('--source', type=str, default='0',
                        help='Test source (0 for webcam, or image/video path)')
    
    args = parser.parse_args()
    
    if args.train:
        train_yolo(data_yaml=args.data, model_name=args.model, epochs=args.epochs)
    
    if args.export:
        export_model(model_path=args.export_path, formats=args.formats)
    
    if args.test:
        test_model(model_path=args.test_path, source=args.source)
    
    if not any([args.train, args.export, args.test]):
        print("=" * 70)
        print("YOLO Training Script - Usage Examples")
        print("=" * 70)
        print("\n📚 Training:")
        print("   python train_yolo_coco128.py --train")
        print("   python train_yolo_coco128.py --train --epochs 50")
        print("   python train_yolo_coco128.py --train --data coco80.yaml")
        print("   python train_yolo_coco128.py --train --model yolov8n.pt")
        print("\n📤 Exporting:")
        print("   python train_yolo_coco128.py --export")
        print("   python train_yolo_coco128.py --export --formats onnx tflite")
        print("\n🧪 Testing:")
        print("   python train_yolo_coco128.py --test")
        print("   python train_yolo_coco128.py --test --source image.jpg")
        print("\n🔄 Combined:")
        print("   python train_yolo_coco128.py --train --export")
        print("=" * 70)
