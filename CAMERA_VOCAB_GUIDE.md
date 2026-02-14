# 📸 Camera-to-Vocab Feature Guide

## 🎯 Tính năng Detection với Từ vựng tiếng Hàn

Hệ thống AI detection đã được tích hợp hoàn chỉnh để nhận diện vật thể và hiển thị từ vựng tiếng Hàn!

---

## ✅ Trạng thái hệ thống

### Backend AI (Flask) ✓
- **URL**: http://localhost:5001
- **Status**: ✅ Running
- **Model**: YOLOv8 Nano
- **Classes**: 80 COCO classes
- **Korean mappings**: 80/80
- **Romanization**: 80/80

### Frontend (Next.js) ✓
- **URL**: http://localhost:3001
- **Status**: ✅ Running
- **Page**: `/camera-vocab`

---

## 🚀 Cách sử dụng

### Bước 1: Truy cập trang Camera-to-Vocab
```bash
# Mở trình duyệt và truy cập:
http://localhost:3001/camera-vocab
```

### Bước 2: Chọn nguồn hình ảnh

**Tùy chọn A: Chụp ảnh bằng camera**
1. Click nút "Bật Camera"
2. Cho phép truy cập camera khi trình duyệt yêu cầu
3. Di chuyển camera đến vật thể cần nhận diện
4. Click "Chụp ảnh"

**Tùy chọn B: Tải ảnh có sẵn**
1. Click nút "Tải ảnh lên"
2. Chọn file ảnh từ thiết bị
3. Hệ thống tự động xử lý

### Bước 3: Xem kết quả detection

Sau khi xử lý, bạn sẽ thấy danh sách các đối tượng được phát hiện:

```
┌─────────────────────────────┐
│ 🍎 사과                      │  Confidence: 96%
│    sagwa                    │
│    Apple                    │
│                             │
│ [🔊] [💾 Lưu từ]            │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 💻 노트북                    │  Confidence: 92%
│    noteubuk                 │
│    Laptop                   │
│                             │
│ [🔊] [💾 Lưu từ]            │
└─────────────────────────────┘
```

### Bước 4: Học từ vựng

**Nghe phát âm:**
- Click icon 🔊 để nghe cách phát âm tiếng Hàn

**Lưu vào từ điển:**
- Click "Lưu từ" để thêm vào vocabulary store
- Từ đã lưu sẽ hiển thị "Đã lưu" (disabled)

---

## 🎨 Giao diện

### Màn hình chính (Layout 2 cột)

```
┌─────────────────────────┬─────────────────────────┐
│                         │                         │
│   📷 HÌNH ẢNH          │   ✨ KẾT QUẢ          │
│                         │                         │
│  ┌─────────────────┐   │  Danh sách đối tượng:   │
│  │                 │   │                         │
│  │  Camera/Image   │   │  1. 컵 (keop) - Cup     │
│  │                 │   │     [🔊] [💾]          │
│  └─────────────────┘   │                         │
│                         │  2. 책 (chaek) - Book   │
│  [Bật Camera]           │     [🔊] [💾]          │
│  [Tải ảnh lên]          │                         │
│                         │  3. 전화기 - Phone      │
│  💡 Hướng dẫn:          │     [🔊] [💾]          │
│  • Chụp ảnh rõ ràng    │                         │
│  • Đảm bảo đủ ánh sáng │  ✅ Tìm thấy 3 đối tượng│
│                         │                         │
└─────────────────────────┴─────────────────────────┘
```

---

## 🔧 API Endpoints

### 1. Health Check
```bash
curl http://localhost:5001/health
```
**Response:**
```json
{
  "status": "ok",
  "message": "AI Backend is running"
}
```

### 2. Object Detection
```bash
curl -X POST http://localhost:5001/detect \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'
```
**Response:**
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
        "y1": 50,
        "x2": 300,
        "y2": 250
      }
    }
  ],
  "total_detected": 5
}
```

### 3. List Vocabulary
```bash
curl http://localhost:5001/vocab/list
```
**Response:**
```json
{
  "total": 80,
  "mappings": {
    "person": "사람",
    "bicycle": "자전거",
    "car": "자동차",
    ...
  }
}
```

---

## 📦 80 COCO Classes với từ vựng tiếng Hàn

<details>
<summary>Xem danh sách đầy đủ (click để mở)</summary>

| English | Korean | Romanization | Category |
|---------|--------|--------------|----------|
| person | 사람 | saram | People |
| bicycle | 자전거 | jajeongeo | Vehicle |
| car | 자동차 | jadongcha | Vehicle |
| motorcycle | 오토바이 | otobai | Vehicle |
| airplane | 비행기 | bihaenggi | Vehicle |
| bus | 버스 | beoseu | Vehicle |
| train | 기차 | gicha | Vehicle |
| truck | 트럭 | teureok | Vehicle |
| boat | 배 | bae | Vehicle |
| traffic light | 신호등 | sinhodeung | Outdoor |
| fire hydrant | 소화전 | sohwajeon | Outdoor |
| stop sign | 정지 표지판 | jeongji pyojipan | Outdoor |
| parking meter | 주차 미터기 | jucha miteogi | Outdoor |
| bench | 벤치 | benchi | Outdoor |
| bird | 새 | sae | Animal |
| cat | 고양이 | goyangi | Animal |
| dog | 개 | gae | Animal |
| horse | 말 | mal | Animal |
| sheep | 양 | yang | Animal |
| cow | 소 | so | Animal |
| elephant | 코끼리 | kokkiri | Animal |
| bear | 곰 | gom | Animal |
| zebra | 얼룩말 | eolrungmal | Animal |
| giraffe | 기린 | girin | Animal |
| backpack | 배낭 | baenang | Accessory |
| umbrella | 우산 | usan | Accessory |
| handbag | 핸드백 | haendeubaek | Accessory |
| tie | 넥타이 | nektai | Accessory |
| suitcase | 여행 가방 | yeohaeng gabang | Accessory |
| frisbee | 프리스비 | peuriseubie | Sports |
| skis | 스키 | seuki | Sports |
| snowboard | 스노보드 | seunobodeu | Sports |
| sports ball | 공 | gong | Sports |
| kite | 연 | yeon | Sports |
| baseball bat | 야구 방망이 | yagu bangmangi | Sports |
| baseball glove | 야구 글러브 | yagu geulleobeu | Sports |
| skateboard | 스케이트보드 | seukeiteu bodeu | Sports |
| surfboard | 서핑보드 | seoping bodeu | Sports |
| tennis racket | 테니스 라켓 | teniseu raket | Sports |
| bottle | 병 | byeong | Kitchen |
| wine glass | 와인잔 | wainjaan | Kitchen |
| cup | 컵 | keop | Kitchen |
| fork | 포크 | pokeu | Kitchen |
| knife | 칼 | kal | Kitchen |
| spoon | 숟가락 | sutgarak | Kitchen |
| bowl | 그릇 | geureut | Kitchen |
| banana | 바나나 | banana | Food |
| apple | 사과 | sagwa | Food |
| sandwich | 샌드위치 | saendeuwichi | Food |
| orange | 오렌지 | orenji | Food |
| broccoli | 브로콜리 | beurokollri | Food |
| carrot | 당근 | danggeun | Food |
| hot dog | 핫도그 | hatdogeu | Food |
| pizza | 피자 | pija | Food |
| donut | 도넛 | doneot | Food |
| cake | 케이크 | keikeu | Food |
| chair | 의자 | uija | Furniture |
| couch | 소파 | sopa | Furniture |
| potted plant | 화분 | hwabun | Furniture |
| bed | 침대 | chimdae | Furniture |
| dining table | 식탁 | siktak | Furniture |
| toilet | 변기 | byeongi | Furniture |
| tv | 텔레비전 | tellebijeon | Electronic |
| laptop | 노트북 | noteubuk | Electronic |
| mouse | 마우스 | mauseu | Electronic |
| remote | 리모컨 | rimokon | Electronic |
| keyboard | 키보드 | kibodeu | Electronic |
| cell phone | 휴대전화 | hyudaejeonhwa | Electronic |
| microwave | 전자레인지 | jeonjareinjinj | Appliance |
| oven | 오븐 | obeun | Appliance |
| toaster | 토스터 | toseuteo | Appliance |
| sink | 싱크대 | singkeudae | Appliance |
| refrigerator | 냉장고 | naengjanggo | Appliance |
| book | 책 | chaek | Indoor |
| clock | 시계 | sigye | Indoor |
| vase | 꽃병 | kkotbyeong | Indoor |
| scissors | 가위 | gawi | Indoor |
| teddy bear | 곰 인형 | gom inhyeong | Indoor |
| hair drier | 헤어드라이어 | heeodeuraie | Indoor |
| toothbrush | 칫솔 | chitsol | Indoor |

</details>

---

## 🐛 Troubleshooting

### Lỗi: "Không thể truy cập camera"
**Nguyên nhân:** Trình duyệt chưa được cấp quyền
**Giải pháp:**
1. Click icon 🔒 trên thanh địa chỉ
2. Cho phép quyền truy cập Camera
3. Refresh trang và thử lại

### Lỗi: "Detection failed"
**Nguyên nhân:** Backend AI chưa chạy
**Giải pháp:**
```bash
cd ai-backend
python3 app.py
```

### Lỗi: Không hiển thị từ vựng tiếng Hàn
**Nguyên nhân:** File labels_ko.json bị thiếu hoặc lỗi
**Giải pháp:**
```bash
cd ai-backend
ls -la labels_ko.json  # Kiểm tra file tồn tại
cat labels_ko.json | jq '.person'  # Test mapping
```

### Lỗi: CORS policy blocked
**Nguyên nhân:** Flask CORS chưa được cấu hình đúng
**Giải pháp:** Đã được fix trong `ai-backend/app.py` với `CORS(app)`

---

## 📊 Hiệu suất

- **Model**: YOLOv8n (Nano) - ~6MB
- **Speed**: 20-50 FPS (CPU), 100+ FPS (GPU)
- **Accuracy**: 50-95% confidence
- **Classes**: 80 COCO objects
- **Input**: Camera/Upload image
- **Output**: JSON với Korean + Romanization

---

## 🎯 Use Cases

### 1. Học từ vựng hàng ngày
Chụp ảnh các vật dụng xung quanh:
- ☕ Cốc nước → 컵 (keop)
- 📱 Điện thoại → 휴대전화 (hyudaejeonhwa)
- 💻 Laptop → 노트북 (noteubuk)

### 2. Học từ vựng trong nhà hàng
Chụp ảnh món ăn:
- 🍕 Pizza → 피자 (pija)
- 🍎 Táo → 사과 (sagwa)
- 🥕 Cà rốt → 당근 (danggeun)

### 3. Học từ vựng giao thông
Chụp ảnh phương tiện:
- 🚗 Ô tô → 자동차 (jadongcha)
- 🚲 Xe đạp → 자전거 (jajeongeo)
- 🚌 Xe buýt → 버스 (beoseu)

### 4. Học từ vựng động vật
Chụp ảnh động vật:
- 🐱 Mèo → 고양이 (goyangi)
- 🐶 Chó → 개 (gae)
- 🐘 Voi → 코끼리 (kokkiri)

---

## 🔄 Quy trình hoạt động

```
┌─────────────┐
│ User Action │
│ (Camera/    │
│  Upload)    │
└──────┬──────┘
       │
       v
┌─────────────┐
│ Frontend    │
│ Capture &   │◄─── http://localhost:3001/camera-vocab
│ Send to API │
└──────┬──────┘
       │ POST /detect
       │ {image: base64}
       v
┌─────────────┐
│ AI Backend  │
│ Flask API   │◄─── http://localhost:5001
└──────┬──────┘
       │
       v
┌─────────────┐
│ YOLOv8      │
│ Detection   │
└──────┬──────┘
       │
       v
┌─────────────┐
│ Korean      │
│ Mapping     │◄─── labels_ko.json (80 classes)
│             │◄─── labels_ko_romanization.json
└──────┬──────┘
       │
       v
┌─────────────┐
│ Response    │
│ {success,   │
│  objects: [ │
│   {korean,  │
│    roman...}│
│  ]}         │
└──────┬──────┘
       │
       v
┌─────────────┐
│ Display     │
│ Results &   │
│ Save to     │
│ Vocabulary  │
└─────────────┘
```

---

## 📝 Ghi chú kỹ thuật

### Frontend (React/Next.js)
- **File**: `app/camera-vocab/page.tsx`
- **State management**: React hooks + Zustand store
- **Camera**: `navigator.mediaDevices.getUserMedia()`
- **Upload**: FileReader API
- **Speech**: Web Speech API (ko-KR)

### Backend (Flask/Python)
- **File**: `ai-backend/app.py`
- **Framework**: Flask + Flask-CORS
- **Model**: Ultralytics YOLOv8
- **Image processing**: OpenCV + NumPy
- **Encoding**: Base64

### Data Files
- `ai-backend/labels_ko.json` - English→Korean
- `ai-backend/labels_ko_romanization.json` - Korean→Roman
- `ai-backend/yolov8n.pt` - YOLO model weights

---

## ✅ Checklist triển khai

- [x] YOLOv8 model loaded (80 classes)
- [x] Korean mappings (80/80)
- [x] Romanization mappings (80/80)
- [x] Flask backend running on port 5001
- [x] Next.js frontend running on port 3001
- [x] CORS enabled
- [x] Camera access working
- [x] Image upload working
- [x] Detection API functional
- [x] Korean display working
- [x] Romanization display working
- [x] Speech synthesis working
- [x] Save to vocabulary working
- [x] PyTorch 2.6 compatibility fixed

---

## 🎉 Kết luận

Tính năng Camera-to-Vocab đã hoạt động **hoàn chỉnh**!

**Truy cập ngay:**
```
http://localhost:3001/camera-vocab
```

**Các tính năng:**
- ✅ Chụp ảnh/Upload ảnh
- ✅ AI Detection (YOLOv8)
- ✅ Hiển thị từ tiếng Hàn
- ✅ Hiển thị romanization
- ✅ Phát âm tiếng Hàn
- ✅ Lưu vào vocabulary
- ✅ 80 COCO classes

**Happy Learning! 🇰🇷**
