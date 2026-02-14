# 🚀 QUICK START - Hệ thống nhận diện đồ vật tiếng Hàn

## 📋 TÓM TẮT

Hệ thống AI nhận diện đồ vật realtime từ webcam và hiển thị tên tiếng Hàn.

**Thời gian setup:** ~5-10 phút  
**Yêu cầu:** Python 3.8+, webcam

---

## ⚡ KHỞI CHẠY NHANH (3 bước)

### 1️⃣ Cài đặt dependencies

```bash
# Di chuyển vào thư mục project
cd "/home/ngocduy/capstone1 /HANGUL /korean-topik-learning-app"

# Cài đặt packages
pip install ultralytics opencv-python pillow numpy flask flask-cors
```

### 2️⃣ Chạy hệ thống

```bash
# Option A: Dùng Makefile (khuyến nghị)
make setup        # Cài đặt dependencies
make split        # Tách dataset train/val
make demo         # Demo realtime với pretrained model

# Option B: Chạy thủ công
python split_coco128.py    # Tách dataset
python realtime_ko.py      # Demo realtime
```

### 3️⃣ Xem kết quả

Webcam sẽ mở và hiển thị:
- Bounding box màu xanh lá quanh các đồ vật
- Tên tiếng Hàn + confidence score
- FPS counter

**Controls:**
- `ESC` - Thoát
- `S` - Chụp ảnh

---

## 🎯 CÁC WORKFLOW CHÍNH

### 🔥 A. Demo Nhanh (không cần train)

Dùng pretrained model, chạy ngay:

```bash
# Cách 1: Makefile
make demo

# Cách 2: Trực tiếp
python realtime_ko.py
```

Model pretrained (`yolov8n.pt`) sẽ tự động download lần đầu.

---

### 🎓 B. Train Model từ đầu

Train model trên COCO128 (128 ảnh):

```bash
# Bước 1: Tách dataset
make split
# Hoặc: python split_coco128.py

# Bước 2: Train (30 epochs, ~10-20 phút)
make train
# Hoặc: python train_yolo_coco128.py --train

# Bước 3: Test model vừa train
make test-model
# Hoặc: python train_yolo_coco128.py --test

# Bước 4: Chạy realtime với model mới
python realtime_ko.py  # Sẽ tự động dùng best.pt
```

**Kết quả train:**
```
runs/detect/train/
  └── weights/
      ├── best.pt     ← Model tốt nhất
      └── last.pt     ← Checkpoint cuối
```

---

### 🌐 C. Chạy Backend API + Frontend

```bash
# Terminal 1: Backend Flask
make backend
# Hoặc: cd ai-backend && python app.py

# Terminal 2: Frontend Next.js
make frontend
# Hoặc: npm run dev

# Terminal 3: Test API
make test-api
```

**API Endpoints:**
- `http://localhost:5001/health` - Health check
- `http://localhost:5001/detect` - Object detection
- `http://localhost:5001/vocab/list` - List all labels

**Frontend:**
- `http://localhost:3000` - Main app
- `http://localhost:3000/camera-vocab` - Camera detection page

---

## 🧪 TESTING

### Test 1: Kiểm tra dataset

```bash
make check-dataset
```

**Expected output:**
```
✅ COCO128 found: 128 images
✅ Split dataset: 102 train, 26 val
```

### Test 2: Test model inference

```bash
# Test với ảnh
python train_yolo_coco128.py --test --source path/to/image.jpg

# Test với webcam
python train_yolo_coco128.py --test --source 0
```

### Test 3: Test backend API

```bash
# Health check
curl http://localhost:5001/health

# List vocabulary
curl http://localhost:5001/vocab/list

# Test detection (cần image base64)
make test-api
```

### Test 4: Benchmark performance

```bash
make benchmark
```

Đo FPS, latency, memory usage.

---

## 🎬 DEMO SCENARIOS

### Demo 1: Scan đồ vật trên bàn làm việc

```bash
python realtime_ko.py
```

Đặt webcam hướng vào bàn, di chuyển các đồ vật:
- ✅ laptop → 노트북
- ✅ cup → 컵
- ✅ mouse → 마우스
- ✅ keyboard → 키보드
- ✅ cell phone → 휴대전화

### Demo 2: Scan nhà bếp

Đồ vật có thể nhận diện:
- ✅ bottle → 병
- ✅ fork → 포크
- ✅ knife → 칼
- ✅ spoon → 숟가락
- ✅ bowl → 그릇
- ✅ refrigerator → 냉장고

### Demo 3: Scan phòng khách

- ✅ tv → 텔레비전
- ✅ couch → 소파
- ✅ chair → 의자
- ✅ book → 책
- ✅ clock → 시계

---

## 📊 CẤU TRÚC FILE

```
korean-topik-learning-app/
├── 🎯 QUICKSTART.md              ← File này
├── 🚀 Makefile                   ← Automation script
├── 📝 COCO128_REALTIME_GUIDE.md  ← Hướng dẫn chi tiết
│
├── 🤖 AI Scripts
│   ├── realtime_ko.py            ← ⭐ Realtime detection
│   ├── train_yolo_coco128.py     ← Training script
│   ├── split_coco128.py          ← Dataset split
│   └── create_coco80.py          ← Create 80-image subset
│
├── ⚙️ Config Files
│   ├── coco128_split.yaml        ← Train/val config
│   └── coco80.yaml               ← 80-image config
│
├── 🗂️ Datasets
│   ├── coco128/                  ← Original (128 images)
│   ├── coco128_split/            ← Train/val split
│   └── coco80/                   ← 80-image subset
│
├── 🎓 Training Results
│   └── runs/detect/train/
│       └── weights/best.pt       ← Trained model
│
├── 🌐 Backend
│   ├── ai-backend/
│   │   ├── app.py                ← Flask API
│   │   ├── labels_ko.json        ← Korean labels
│   │   └── labels_ko_romanization.json
│   └── app/                      ← Next.js frontend
│
└── 📚 Documentation
    ├── README.md
    └── AI_DETECTION_README.md
```

---

## 🛠️ MAKEFILE COMMANDS

```bash
# Setup & Installation
make setup              # Cài đặt dependencies
make check-dataset      # Kiểm tra dataset

# Dataset Preparation
make split              # Tách COCO128 train/val
make create-80          # Tạo subset 80 ảnh

# Training
make train              # Train model (30 epochs)
make train-50           # Train 50 epochs
make export             # Export model sang ONNX

# Testing & Demo
make demo               # Demo realtime với pretrained
make test-model         # Test trained model
make benchmark          # Đo performance

# Backend & Frontend
make backend            # Chạy Flask API
make frontend           # Chạy Next.js dev server
make test-api           # Test API endpoints

# Utilities
make clean              # Xóa files tạm
make clean-all          # Xóa hết (dataset, models, cache)
make help               # Hiển thị help
```

---

## 🔧 TROUBLESHOOTING

### ❌ Lỗi: Camera không mở

```bash
# Kiểm tra camera
make check-camera

# Thử camera khác (index 1, 2, ...)
# Sửa trong realtime_ko.py: cap = cv2.VideoCapture(1)
```

### ❌ Lỗi: Font tiếng Hàn không hiển thị

**Windows:**
```bash
# Font thường có sẵn: C:/Windows/Fonts/malgun.ttf
# Nếu không có, download Nanum Gothic
```

**Linux:**
```bash
sudo apt install fonts-noto-cjk
# Hoặc
sudo apt install fonts-nanum
```

**macOS:**
```bash
# Font hệ thống có sẵn
ls /System/Library/Fonts/AppleSDGothicNeo.ttc
```

### ❌ Lỗi: Model quá chậm

```bash
# Giảm resolution trong realtime_ko.py:
CAMERA_WIDTH = 480
CAMERA_HEIGHT = 360
IMGSZ = 416  # Thay vì 640
```

### ❌ Lỗi: Import error ultralytics

```bash
pip install --upgrade ultralytics
```

---

## 📈 PERFORMANCE BENCHMARKS

| Thiết bị | FPS | Latency | Model |
|----------|-----|---------|-------|
| CPU i5 | 10-15 | ~70ms | yolo11n |
| GPU RTX 3060 | 60+ | ~16ms | yolo11n |
| Apple M1 | 30-40 | ~30ms | yolo11n |
| Raspberry Pi 4 | 3-5 | ~200ms | yolo11n |

**Tips tăng tốc:**
- ✅ Dùng GPU nếu có
- ✅ Giảm resolution (640→480→320)
- ✅ Dùng model nhỏ (nano)
- ✅ Giảm confidence threshold

---

## 📚 TÀI LIỆU THAM KHẢO

### Hướng dẫn chi tiết
- [COCO128_REALTIME_GUIDE.md](COCO128_REALTIME_GUIDE.md) - Hướng dẫn đầy đủ A→Z
- [AI_DETECTION_README.md](AI_DETECTION_README.md) - AI backend documentation

### Dataset & Models
- COCO128: https://github.com/ultralytics/assets/releases/download/v0.0.0/coco128.zip
- YOLO Models: https://docs.ultralytics.com/models/yolo11/
- Korean Labels: `ai-backend/labels_ko.json`

### API Documentation
- Flask Backend: http://localhost:5001/health
- Next.js Frontend: http://localhost:3000

---

## 🎯 NEXT STEPS

Sau khi demo thành công:

1. **Deploy lên Production:**
   ```bash
   make build           # Build production
   make deploy          # Deploy to server
   ```

2. **Thêm custom classes:**
   - Thu thập ảnh mới
   - Label bằng Roboflow/LabelImg
   - Train lại model

3. **Mobile deployment:**
   ```bash
   make export-mobile   # Export TFLite
   ```

4. **Tích hợp vào app:**
   - Camera vocab page: `app/camera-vocab/page.tsx`
   - API integration đã sẵn sàng

---

## ✅ CHECKLIST

- [ ] Đã cài dependencies (`make setup`)
- [ ] Dataset COCO128 đã có
- [ ] Split train/val thành công (`make split`)
- [ ] Demo realtime chạy OK (`make demo`)
- [ ] Backend API chạy (`make backend`)
- [ ] Frontend accessible (`make frontend`)
- [ ] Test detection với các đồ vật khác nhau
- [ ] Font tiếng Hàn hiển thị đúng
- [ ] FPS đạt yêu cầu (>10 FPS)

---

## 💡 TIPS & TRICKS

### Tip 1: Cải thiện độ chính xác
- Đặt camera ổn định, ánh sáng đủ
- Giữ đồ vật trong khung hình rõ ràng
- Điều chỉnh confidence threshold

### Tip 2: Speed up training
```bash
# Dùng GPU
export CUDA_VISIBLE_DEVICES=0

# Multi-GPU
python train_yolo_coco128.py --train --device 0,1
```

### Tip 3: Custom vocabulary
Thêm từ vựng mới vào `labels_ko.json`:
```json
{
  "new_object": "새로운 물건",
  "another_item": "다른 물건"
}
```

### Tip 4: Save detections
Trong `realtime_ko.py`, nhấn phím `S` để chụp screenshot.

---

## 📞 SUPPORT

**Issues:**
- Check terminal logs
- Verify file paths
- Ensure camera permissions

**Performance:**
- Monitor FPS counter
- Adjust resolution if needed
- Use GPU for better speed

**Hỗ trợ thêm:**
- Xem logs: `tail -f logs/app.log`
- Debug mode: Set `verbose=True` trong scripts

---

## 🎉 KẾT LUẬN

**Bạn đã sẵn sàng!**

```bash
# Chạy demo ngay:
make demo

# Hoặc full pipeline:
make setup && make split && make train && python realtime_ko.py
```

**Kết quả:** Webcam hiển thị đồ vật với tên tiếng Hàn realtime! 🚀

---

**Version:** 1.0.0  
**Last updated:** 2026-02-15  
**Platform:** Linux (Ubuntu/Debian recommended)
