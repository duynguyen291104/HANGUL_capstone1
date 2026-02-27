# 🗂️ CẤU TRÚC HỆ THỐNG - TOPIK LEARNING APP

## 📁 CẤU TRÚC DỰ ÁN

```
korean-topik-learning-app/
│
├── 🎨 FRONTEND (Next.js)
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Trang chủ
│   │   ├── layout.tsx                # Layout chính
│   │   ├── globals.css               # CSS toàn cục
│   │   ├── pronunciation/            # Trang phát âm
│   │   ├── handwriting/              # Trang viết tay
│   │   ├── camera-vocab/             # Trang nhận diện camera
│   │   ├── feed/                     # Trang feed
│   │   ├── tournament/               # Trang thi đấu
│   │   ├── monthly-tasks/            # Nhiệm vụ tháng
│   │   ├── profile/                  # Trang cá nhân
│   │   └── api/                      # API routes
│   │
│   ├── components/                    # React components
│   │   ├── Navigation.tsx
│   │   ├── VocabCard.tsx
│   │   ├── HandwritingPad.tsx
│   │   └── ui/                       # Shadcn UI components
│   │
│   ├── lib/                          # Utilities & helpers
│   ├── stores/                       # Zustand stores (state management)
│   ├── data/                         # Static data files
│   ├── public/                       # Static assets (images, manifest)
│   │
│   ├── package.json                  # Dependencies & scripts
│   ├── next.config.ts                # Next.js config
│   ├── tailwind.config.ts            # Tailwind CSS config
│   └── tsconfig.json                 # TypeScript config
│
├── 🤖 BACKEND (Flask AI)
│   └── ai-backend/
│       ├── app.py                    # Flask server chính ⭐
│       ├── requirements.txt          # Python dependencies
│       ├── yolov8n.pt               # YOLOv8 model
│       ├── labels_ko.json           # Korean labels
│       ├── labels_ko_romanization.json
│       ├── romanization.json
│       ├── vocab_mapping.json
│       └── test_detection.py
│
├── 🗄️ DATABASE (Docker)
│   ├── docker-compose.yml            # Docker services config ⭐
│   ├── .env                          # Environment variables
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema ⭐
│   │   ├── migrations/               # Database migrations
│   │   └── seed.ts                   # Seed data
│   └── init-db/                      # Init SQL scripts
│
└── 🛠️ SCRIPTS & CONFIG
    ├── Makefile                      # Quick commands
    ├── Dockerfile                    # Docker build file
    └── *.sh                          # Shell scripts

```

---

## 🚀 CÁC LỆNH CHẠY HỆ THỐNG

### 1️⃣ DATABASE (PostgreSQL + PgAdmin)

**File config:** `docker-compose.yml`

```bash
# Di chuyển vào thư mục dự án
cd ~/capstone1\ /HANGUL\ /korean-topik-learning-app

# Khởi động database
docker compose up -d

# Kiểm tra trạng thái
docker compose ps

# Restart database
docker compose restart

# Dừng database
docker compose down

# Xem logs
docker compose logs -f

# Reset database (XÓA TẤT CẢ DỮ LIỆU)
docker compose down -v
```

**Thông tin kết nối:**
- PostgreSQL: `localhost:5432`
- PgAdmin: `http://localhost:5050`
- Username: `topik_user` (trong file .env)
- Password: `topik_password` (trong file .env)
- Database: `topik_learning_db`

---

### 2️⃣ BACKEND (Flask AI Server)

**File chính:** `ai-backend/app.py`

```bash
# Di chuyển vào thư mục backend
cd ~/capstone1\ /HANGUL\ /korean-topik-learning-app/ai-backend

# Khởi động backend (foreground)
python3 app.py

# Khởi động backend (background) - KHÔNG KHUYẾN KHÍCH
nohup python3 app.py > backend.log 2>&1 &

# Dừng backend (nếu chạy background)
pkill -f "python3 app.py"

# Hoặc tìm và kill process
ps aux | grep "python3 app.py"
kill <PID>
```

**Endpoints:**
- Health check: `http://localhost:5001/health`
- Detect API: `http://localhost:5001/detect`
- Vocab list: `http://localhost:5001/vocab/list`

**Dependencies:**
```bash
# Install dependencies
pip install -r ai-backend/requirements.txt

# Main packages:
# - flask
# - flask-cors
# - ultralytics (YOLOv8)
# - opencv-python
# - pillow
```

---

### 3️⃣ FRONTEND (Next.js)

**File config:** `package.json`, `next.config.ts`

```bash
# Di chuyển vào thư mục dự án
cd ~/capstone1\ /HANGUL\ /korean-topik-learning-app

# Install dependencies (chỉ lần đầu)
npm install

# Khởi động development server
npm run dev

# Build production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

**URLs:**
- Development: `http://localhost:3001` (hoặc 3000)
- Network: `http://192.168.10.250:3001`

---

## 🔧 LỆNH NHANH VỚI MAKEFILE

```bash
cd ~/capstone1\ /HANGUL\ /korean-topik-learning-app

# Xem tất cả lệnh có sẵn
make help

# Setup toàn bộ dự án (lần đầu)
make setup

# Khởi động development
make dev

# Khởi động Docker
make docker-up

# Dừng Docker
make docker-down

# Restart Docker
make docker-restart

# Database migrations
make db-migrate

# Seed database
make db-seed

# Prisma Studio (DB GUI)
make db-studio

# AI Backend
make backend

# Camera vocab system
make camera-vocab
```

---

## 📝 QUY TRÌNH KHỞI ĐỘNG CHUẨN

### Lần đầu tiên (Setup):
```bash
cd ~/capstone1\ /HANGUL\ /korean-topik-learning-app

# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
pip install -r ai-backend/requirements.txt

# 3. Start database
docker compose up -d

# 4. Run migrations
npx prisma migrate dev

# 5. Seed database (optional)
npm run prisma:seed
```

### Khởi động hàng ngày:

**Terminal 1 - Database:**
```bash
cd ~/capstone1\ /HANGUL\ /korean-topik-learning-app
docker compose up -d
```

**Terminal 2 - Backend:**
```bash
cd ~/capstone1\ /HANGUL\ /korean-topik-learning-app/ai-backend
python3 app.py
```

**Terminal 3 - Frontend:**
```bash
cd ~/capstone1\ /HANGUL\ /korean-topik-learning-app
npm run dev
```

---

## 🔍 KIỂM TRA TRẠNG THÁI HỆ THỐNG

```bash
# Kiểm tra Docker
docker compose ps

# Kiểm tra backend đang chạy
curl http://localhost:5001/health

# Kiểm tra frontend đang chạy
curl http://localhost:3001

# Kiểm tra database connection
docker exec topik-postgres psql -U topik_user -d topik_learning_db -c "SELECT 1;"

# Kiểm tra processes
ps aux | grep -E "python3 app.py|next-server|node"

# Kiểm tra ports đang sử dụng
lsof -i :3001  # Frontend
lsof -i :5001  # Backend
lsof -i :5432  # Database
lsof -i :5050  # PgAdmin
```

---

## 🛑 DỪNG TẤT CẢ SERVICES

```bash
# Dừng frontend (Ctrl+C trong terminal đang chạy npm run dev)

# Dừng backend
pkill -f "python3 app.py"

# Dừng database
cd ~/capstone1\ /HANGUL\ /korean-topik-learning-app
docker compose down
```

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi: Port đã được sử dụng
```bash
# Tìm process đang dùng port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Lỗi: Backend không kết nối được
```bash
# Kiểm tra backend đang chạy
ps aux | grep "python3 app.py"

# Kiểm tra logs
cd ~/capstone1\ /HANGUL\ /korean-topik-learning-app/ai-backend
python3 app.py  # Xem lỗi trực tiếp
```

### Lỗi: Database không kết nối được
```bash
# Kiểm tra Docker
docker compose ps

# Xem logs database
docker compose logs postgres

# Restart database
docker compose restart postgres
```

### Lỗi: Module not found (Python)
```bash
cd ~/capstone1\ /HANGUL\ /korean-topik-learning-app/ai-backend
pip install -r requirements.txt
```

### Lỗi: Module not found (Node)
```bash
cd ~/capstone1\ /HANGUL\ /korean-topik-learning-app
npm install
```

---

## 📊 THÔNG TIN QUAN TRỌNG

### Environment Variables (.env)
```env
DATABASE_URL="postgresql://topik_user:topik_password@localhost:5432/topik_learning_db"
POSTGRES_USER=topik_user
POSTGRES_PASSWORD=topik_password
POSTGRES_DB=topik_learning_db
PGADMIN_EMAIL=admin@topik.com
PGADMIN_PASSWORD=admin123
```

### Tech Stack
- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend:** Flask, Python, YOLOv8, OpenCV
- **Database:** PostgreSQL 16, Prisma ORM
- **State:** Zustand
- **Deployment:** Docker, Docker Compose

---

## 📚 TÀI LIỆU THAM KHẢO

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Flask: https://flask.palletsprojects.com/
- YOLOv8: https://docs.ultralytics.com/
- Docker: https://docs.docker.com/

---

**Tạo bởi:** GitHub Copilot
**Ngày cập nhật:** February 27, 2026
