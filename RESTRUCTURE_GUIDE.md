# Tài liệu cấu trúc mới - Korean TOPIK Learning App

## 📋 Tổng quan thay đổi

Hệ thống đã được thiết kế lại với cấu trúc trang và routing mới, tối ưu hóa trải nghiệm người dùng.

---

## 🗂️ Cấu trúc trang mới

### ✅ Các trang được GIỮ NGUYÊN:
- **Trang chủ** (`/`) - Trang chính của ứng dụng

### ❌ Các trang đã XÓA:
- ~~Thư viện~~ (`/library`) - Đã xóa
- ~~Import~~ (`/import`) - Đã xóa  
- ~~Write~~ (`/write`) - Đã thay thế bằng Luyện chữ

### 🔄 Các trang ĐỔI TÊN:
| Tên cũ | Route cũ | Tên mới | Route mới | Icon |
|--------|----------|---------|-----------|------|
| Thẻ ghi nhớ | `/flashcards` | **Phát âm** | `/pronunciation` | 🎤 Mic |
| Tiến độ | `/progress` | **Nhiệm vụ hằng tháng** | `/monthly-tasks` | 📅 CalendarCheck |
| Trò chơi | `/games` | **Giải đấu** | `/tournament` | 🏆 Trophy |
| Cài đặt | `/settings` | **Quản lý thông tin** | `/profile` | 👤 User |

### ✨ 3 Trang MỚI:

#### 1. **Bảng tin** (`/feed`)
- 📰 Icon: Newspaper
- **Chức năng:**
  - Hiển thị hoạt động gần đây
  - Thành tích và cột mốc
  - Mẹo học tập hàng ngày
  - Thử thách hàng tháng
  - Xu hướng cộng đồng
- **Thống kê nhanh:**
  - Chuỗi học tập (streak)
  - Tổng từ vựng đã học
  - Xếp hạng

#### 2. **Luyện chữ** (`/handwriting`)
- ✍️ Icon: PenTool
- **Chức năng:**
  - Luyện viết các ký tự Hangul cơ bản (phụ âm + nguyên âm)
  - Vẽ theo mẫu chữ cái trên canvas
  - Hệ thống chấm điểm tự động
  - 24 ký tự mẫu để luyện tập
  - Hướng dẫn từng bước
- **Tính năng:**
  - Hiển thị/ẩn chữ mẫu
  - Phát âm từng ký tự
  - Theo dõi tiến độ học tập
  - Điều hướng giữa các ký tự

#### 3. **Camera to Vocab** (`/camera-vocab`)
- 📷 Icon: Camera
- **Chức năng chính:**
  
  **A. Chụp ảnh (Camera Mode):**
  - Bật camera thiết bị
  - Chụp ảnh vật thể
  - Nhận diện tự động đối tượng
  - Hiển thị từ vựng tiếng Hàn tương ứng
  
  **B. Upload ảnh (Upload Mode):**
  - Tải ảnh từ thiết bị
  - Scan và nhận diện vật thể
  - Chuyển đổi thành từ vựng tiếng Hàn
  
- **Thông tin hiển thị:**
  - Chữ Hàn (한글)
  - Phiên âm (romanization)
  - Nghĩa tiếng Việt
  - Độ chính xác (confidence %)
  - Danh mục từ vựng
  
- **Tính năng bổ sung:**
  - Phát âm từ
  - Lưu từ vào từ điển cá nhân
  - Thống kê số từ đã lưu

---

## 🧭 Navigation (Menu)

### Desktop Navigation (Sidebar):
```
🏠 Trang chủ           → /
📰 Bảng tin            → /feed
✍️ Luyện chữ           → /handwriting
📷 Camera to Vocab     → /camera-vocab
🎤 Phát âm             → /pronunciation
🏆 Giải đấu            → /tournament
📅 Nhiệm vụ hằng tháng → /monthly-tasks
👤 Quản lý thông tin   → /profile
```

### Mobile Navigation (Bottom Bar - 4 trang chính):
```
🏠 Trang chủ    📰 Bảng tin    🎤 Phát âm    🏆 Giải đấu
```

---

## 🎮 Chi tiết trang Giải đấu (Tournament)

Các game con trong giải đấu đã được cập nhật routing:

| Game | Route cũ | Route mới |
|------|----------|-----------|
| Trắc nghiệm | `/games/quiz` | `/tournament/quiz` |
| Luyện nghe | `/games/listening` | `/tournament/listening` |
| Gõ từ | `/games/typing` | `/tournament/typing` |
| Ghép đôi | `/games/matching` | `/tournament/matching` |
| Tốc độ | `/games/speed` | `/tournament/speed` |

**Các link đã được cập nhật:**
- Tất cả nút "Quay lại" → `/tournament`
- Tất cả link "Về trang games" → "Về trang giải đấu"
- Thay thế link `/import` → `/camera-vocab`

---

## 📱 Tính năng chính từng trang

### 🎤 Phát âm (`/pronunciation`)
- Flashcard với SRS (Spaced Repetition System)
- Phát âm tự động
- Theo dõi tiến độ học tập
- Session giới hạn 20 từ/lần

### 📅 Nhiệm vụ hằng tháng (`/monthly-tasks`)
- Thống kê từ vựng đã học
- Theo dõi chuỗi học tập
- Hiển thị từ cần ôn tập
- Mục tiêu hàng tháng

### 🏆 Giải đấu (`/tournament`)
- 5 mini games thử thách
- Hệ thống điểm số
- Bảng xếp hạng
- Theo dõi thời gian

### 👤 Quản lý thông tin (`/profile`)
- Cài đặt cá nhân
- Quản lý tài khoản
- Thống kê tổng quan

---

## 🔧 Thay đổi kỹ thuật

### Files đã thay đổi:
1. `components/Navigation.tsx` - Cập nhật menu và routing
2. `app/page.tsx` - Cập nhật links trang chủ
3. `app/feed/page.tsx` - **TRANG MỚI**
4. `app/handwriting/page.tsx` - **TRANG MỚI**
5. `app/camera-vocab/page.tsx` - **TRANG MỚI**
6. `app/tournament/**/*.tsx` - Cập nhật tất cả links
7. Đổi tên folders:
   - `flashcards/` → `pronunciation/`
   - `progress/` → `monthly-tasks/`
   - `games/` → `tournament/`
   - `settings/` → `profile/`

### Files/Folders đã xóa:
- `app/library/`
- `app/import/`
- `app/write/`

---

## 🚀 Chạy ứng dụng

### Development:
```bash
# Khởi động Docker (Database)
docker compose up -d

# Chạy migrations
npm run prisma:migrate

# Khởi động server
npm run dev
```

### Truy cập:
- **Frontend & Backend:** http://localhost:3000
- **PostgreSQL:** localhost:5432
- **PgAdmin:** http://localhost:5050

---

## 📊 Tổng kết

### Số lượng trang:
- **Trước:** 8 trang (Trang chủ, Thư viện, Thẻ ghi nhớ, Trò chơi, Tiến độ, Import, Cài đặt, Write)
- **Sau:** 8 trang (Trang chủ, Bảng tin, Luyện chữ, Camera to Vocab, Phát âm, Giải đấu, Nhiệm vụ hằng tháng, Quản lý thông tin)

### Thay đổi chính:
- ✅ 3 trang mới với chức năng độc đáo
- ✅ Đổi tên 4 trang để rõ nghĩa hơn
- ✅ Xóa 3 trang cũ không cần thiết
- ✅ Cập nhật toàn bộ routing và navigation
- ✅ Không có lỗi compile

---

**Ngày cập nhật:** 12/02/2026  
**Version:** 2.0.0  
**Status:** ✅ Hoàn thành và đang chạy
