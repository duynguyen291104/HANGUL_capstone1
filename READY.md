# 🚀 HỆ THỐNG NHẬN DIỆN ĐỒ VẬT TIẾNG HÀN - ĐÃ SẴN SÀNG!

## ✅ Đã hoàn thành Setup

Hệ thống của bạn đã được cài đặt và sẵn sàng sử dụng!

### 📊 Trạng thái hiện tại:

```
✅ Dataset COCO128: 128 ảnh
✅ Train/Val split: 103 train, 25 val
✅ Korean labels: 80 classes
✅ Dependencies: Đã cài đặt
```

---

## 🎯 CÁCH CHẠY HỆ THỐNG

### Option 1: Demo Script (Khuyến nghị)

```bash
./demo.sh
```

Menu sẽ hiện ra với 4 lựa chọn:
1. 🎥 Realtime webcam detection
2. 🖼️  Test trên ảnh
3. 🚀 Chạy Backend API
4. 📊 Benchmark performance

### Option 2: Chạy trực tiếp

#### A. Realtime Detection (Webcam)

```bash
python3 realtime_ko.py
```

**Controls:**
- `ESC` - Thoát
- `S` - Chụp ảnh

**Kết quả:** Webcam hiển thị đồ vật với tên tiếng Hàn!

#### B. Backend API Server

```bash
cd ai-backend
python3 app.py
```

**Endpoints:**
- http://localhost:5001/health
- http://localhost:5001/detect
- http://localhost:5001/vocab/list

**Test API:**
```bash
./test_api.sh
```

#### C. Frontend Next.js

```bash
npm run dev
```

Truy cập: http://localhost:3000/camera-vocab

---

## 🎬 DEMO SCENARIOS

### Scenario 1: Scan bàn làm việc

```bash
python3 realtime_ko.py
```

Đặt các đồ vật trước camera:
- ✅ laptop → **노트북** (noteubuk)
- ✅ cup → **컵** (keop)
- ✅ mouse → **마우스** (mauseu)
- ✅ keyboard → **키보드** (kibodeu)
- ✅ cell phone → **휴대전화** (hyudaejeonhwa)
- ✅ book → **책** (chaek)

### Scenario 2: Scan nhà bếp

- ✅ bottle → **병** (byeong)
- ✅ cup → **컵** (keop)
- ✅ fork → **포크** (pokeu)
- ✅ knife → **칼** (kal)
- ✅ spoon → **숟가락** (sutgarak)
- ✅ bowl → **그릇** (geureut)

### Scenario 3: Scan phòng khách

- ✅ tv → **텔레비전** (tellebijeon)
- ✅ couch → **소파** (sopa)
- ✅ chair → **의자** (uija)
- ✅ clock → **시계** (sigye)

---

## 📝 CÁC LỆNH MAKE HỮU ÍCH

```bash
# Setup & Check
make setup              # Cài đặt dependencies
make check-dataset      # Kiểm tra dataset
make check-camera       # Kiểm tra camera

# Demo & Test
make demo               # Chạy demo realtime
make test-model         # Test trained model
make benchmark          # Đo performance

# Backend
make backend            # Chạy Flask API
make test-api           # Test API endpoints

# Training (nếu muốn train lại)
make train              # Train 30 epochs (~10-20 phút)
make train-50           # Train 50 epochs
make export             # Export sang ONNX

# Utilities
make ai-help            # Xem tất cả AI commands
make help               # Xem tất cả commands
```

---

## 🔧 TÙY CHỈNH

### Thay đổi Confidence Threshold

File: `realtime_ko.py`, dòng 73:
```python
CONF_THRESHOLD = 0.35  # Giảm xuống 0.25 để detect nhiều hơn
```

### Thay đổi Camera Resolution

File: `realtime_ko.py`, dòng 79-80:
```python
CAMERA_WIDTH = 640   # Tăng lên 1280 nếu camera hỗ trợ
CAMERA_HEIGHT = 480  # Tăng lên 720
```

### Sử dụng Camera khác

```python
cap = cv2.VideoCapture(1)  # Thay 0 thành 1, 2, ...
```

---

## 🐛 TROUBLESHOOTING

### ❌ Camera không mở được

```bash
# Kiểm tra camera
make check-camera

# Thử camera index khác
# Sửa trong realtime_ko.py: cap = cv2.VideoCapture(1)
```

### ❌ Font tiếng Hàn không hiển thị

Script tự động detect font theo OS. Nếu vẫn lỗi:

**Linux:**
```bash
sudo apt install fonts-noto-cjk fonts-nanum
```

**Windows:** Font Malgun Gothic thường có sẵn

**macOS:** Font AppleSDGothicNeo có sẵn

### ❌ FPS quá thấp

```bash
# Giảm resolution trong realtime_ko.py:
IMGSZ = 416  # Thay vì 640
CAMERA_WIDTH = 480
CAMERA_HEIGHT = 360
```

---

## 📊 PERFORMANCE BENCHMARK

Chạy test:
```bash
make benchmark
```

Expected results:
- CPU i5: 10-15 FPS
- GPU RTX 3060: 60+ FPS
- Apple M1: 30-40 FPS

---

## 🎯 NEXT STEPS

### 1. Train model của riêng bạn

```bash
# Train với dataset đã split
make train

# Kết quả: runs/detect/train/weights/best.pt
# Script realtime_ko.py sẽ tự động dùng model này
```

### 2. Tích hợp vào Frontend

Backend API đã sẵn sàng:
```bash
make backend  # Start Flask server
```

Frontend gọi API:
```javascript
const response = await fetch('http://localhost:5001/detect', {
  method: 'POST',
  body: JSON.stringify({ image: base64Image })
});
```

### 3. Deploy Production

```bash
# Build frontend
npm run build

# Export model
make export  # → ONNX format

# Deploy backend
# Sử dụng gunicorn hoặc Docker
```

---

## 📚 TÀI LIỆU THAM KHẢO

- **[QUICKSTART.md](QUICKSTART.md)** - Hướng dẫn quick start
- **[COCO128_REALTIME_GUIDE.md](COCO128_REALTIME_GUIDE.md)** - Hướng dẫn chi tiết A→Z
- **[AI_DETECTION_README.md](AI_DETECTION_README.md)** - AI backend docs

---

## 🎉 SẴN SÀNG!

Hệ thống đã được setup và ready to use!

```bash
# Chạy demo ngay:
./demo.sh

# Hoặc:
python3 realtime_ko.py
```

**Enjoy! 🚀**

---

## 📞 QUICK REFERENCE

```bash
# Các lệnh thường dùng nhất:
python3 realtime_ko.py           # Demo realtime
./demo.sh                        # Menu demo
make demo                        # Demo (Makefile)
make backend                     # Chạy API
make train                       # Train model
make ai-help                     # Xem help
```

**System Status:** ✅ Ready  
**Dataset:** ✅ 103 train, 25 val  
**Labels:** ✅ 80 Korean classes  
**Model:** ⚠️ Using pretrained (hoặc train với `make train`)
