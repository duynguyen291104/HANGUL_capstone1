# Real-time Object Detection với YOLO - Nhận diện và hiển thị tiếng Hàn

## 🎯 Tổng quan

Hệ thống AI nhận diện đồ vật realtime và hiển thị tên tiếng Hàn + romanization cho ứng dụng học tiếng Hàn TOPIK.

## 📁 Cấu trúc Dataset

```
korean-topik-learning-app/
├── coco128/              # Dataset gốc (128 ảnh)
│   ├── images/train2017/
│   └── labels/train2017/
├── coco80/               # Dataset đã cắt (80 ảnh) - sẽ tạo bằng script
│   ├── images/train/
│   └── labels/train/
├── ai-backend/           # Flask backend với YOLO
│   ├── app.py
│   ├── labels_ko.json              # Mapping EN→KO (80 classes)
│   ├── labels_ko_romanization.json # Romanization
│   └── yolov8n.pt
├── coco80.yaml           # YOLO config
├── create_coco80.py      # Script tạo dataset 80 ảnh
└── train_yolo.py         # Script training YOLO
```

## 🚀 Hướng dẫn sử dụng

### Bước 1: Tạo Dataset 80 ảnh từ COCO128

```bash
cd "/home/ngocduy/capstone1 /HANGUL /korean-topik-learning-app"
python create_coco80.py
```

Kết quả: Tạo folder `coco80/` với 80 ảnh + labels tương ứng.

### Bước 2: Training YOLO (Tùy chọn)

Nếu muốn fine-tune model:

```bash
# Cài đặt dependencies
pip install ultralytics

# Train model
python train_yolo.py --train

# Hoặc chỉ dùng pretrained model (bỏ qua bước này)
```

Kết quả: Model được lưu tại `runs/detect/korean-vocab-detector/weights/best.pt`

### Bước 3: Export Model (Tùy chọn)

```bash
# Export sang ONNX để deploy
python train_yolo.py --export
```

### Bước 4: Chạy AI Backend

```bash
cd ai-backend
pip install -r requirements.txt
python app.py
```

Server chạy tại `http://localhost:5001`

### Bước 5: Test Detection

```bash
# Test với ảnh
cd ai-backend
python test_detection.py
```

## 📡 API Endpoints

### 1. Health Check
```bash
GET http://localhost:5001/health
```

### 2. Object Detection
```bash
POST http://localhost:5001/detect
Content-Type: application/json

{
  "image": "base64_encoded_image_data"
}
```

Response:
```json
{
  "success": true,
  "objects": [
    {
      "name": "cup",
      "korean": "컵",
      "romanization": "keop",
      "confidence": 0.95,
      "bbox": {
        "x1": 100,
        "y1": 150,
        "x2": 200,
        "y2": 250
      }
    }
  ],
  "total_detected": 5
}
```

### 3. List All Vocabulary
```bash
GET http://localhost:5001/vocab/list
```

### 4. Add Custom Vocabulary
```bash
POST http://localhost:5001/vocab/add
Content-Type: application/json

{
  "english": "new_object",
  "korean": "새 물건"
}
```

## 🎨 Frontend Integration

### Camera Component Usage

```typescript
// In app/camera-vocab/page.tsx
const captureAndDetect = async () => {
  // Capture from camera
  const imageData = canvas.toDataURL('image/jpeg');
  
  // Call AI backend
  const response = await fetch('http://localhost:5001/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageData })
  });
  
  const result = await response.json();
  
  // Display Korean labels
  result.objects.forEach(obj => {
    console.log(`${obj.korean} (${obj.romanization}) - ${obj.confidence}`);
    // Draw bounding box + Korean text on canvas
  });
};
```

## 🔧 Configuration

### Model Selection

Trong `train_yolo.py`, bạn có thể chọn model:
- `yolo11n.pt` - Nhanh nhất, độ chính xác vừa
- `yolo11s.pt` - Cân bằng
- `yolo11m.pt` - Chính xác hơn, chậm hơn

### Confidence Threshold

Trong `ai-backend/app.py`, dòng 73:
```python
results = model(img, conf=0.5)  # Điều chỉnh 0.5 → 0.3 để detect nhiều hơn
```

## 📊 COCO 80 Classes (Đầy đủ)

Dataset hỗ trợ 80 loại đồ vật thông dụng:

**Con người & Phương tiện:**
- person (사람), bicycle (자전거), car (자동차), motorcycle (오토바이), bus (버스)...

**Đồ vật hàng ngày:**
- bottle (병), cup (컵), fork (포크), knife (칼), spoon (숟가락), bowl (그릇)...

**Điện tử:**
- tv (텔레비전), laptop (노트북), mouse (마우스), keyboard (키보드), cell phone (휴대전화)...

**Thực phẩm:**
- apple (사과), banana (바나나), sandwich (샌드위치), pizza (피자)...

**Nội thất:**
- chair (의자), couch (소파), bed (침대), dining table (식탁)...

Xem đầy đủ trong `ai-backend/labels_ko.json`

## 🎯 Workflow Hoàn chỉnh

1. **Chuẩn bị:** `create_coco80.py` → tạo dataset 80 ảnh
2. **Training (optional):** `train_yolo.py --train` → fine-tune model
3. **Backend:** `python ai-backend/app.py` → chạy Flask server
4. **Frontend:** Camera component gọi API `/detect`
5. **Hiển thị:** Vẽ bbox + text tiếng Hàn lên camera frame

## 🔥 Quick Start (Không train, chỉ inference)

Nếu chỉ muốn dùng pretrained model:

```bash
# 1. Tạo dataset (cho đầy đủ)
python create_coco80.py

# 2. Chạy backend với pretrained YOLO
cd ai-backend
python app.py
```

Model pretrained `yolov8n.pt` đã có sẵn và nhận diện được 80 lớp COCO!

## 📝 Notes

- **Mobile deployment:** Export sang TFLite bằng `yolo export format=tflite`
- **Performance:** Nếu chậm, giảm image size: `imgsz=320` thay vì 640
- **Thêm class:** Nếu muốn detect thêm đồ vật, cần dataset riêng + retrain

## 🐛 Troubleshooting

**Lỗi "No module named ultralytics":**
```bash
pip install ultralytics
```

**Model chậm trên CPU:**
- Dùng model nano (`yolo11n.pt`)
- Giảm imgsz xuống 320
- Hoặc dùng GPU (CUDA/MPS)

**Dataset không tìm thấy:**
- Kiểm tra đường dẫn trong `coco80.yaml`
- Chạy `create_coco80.py` trước

## 📞 Support

Nếu có lỗi, check:
1. Log của Flask backend (`python app.py`)
2. Console của frontend
3. File `coco80.yaml` có đúng path không
