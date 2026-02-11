# Korean TOPIK Learning App - Database & DevOps Setup

## 📦 Database Setup

### PostgreSQL với Docker

Database đã được cấu hình với PostgreSQL 16 chạy trên Docker Container.

#### Khởi động Database

```bash
# Khởi động PostgreSQL và PgAdmin
docker compose up -d

# Kiểm tra status
docker compose ps

# Xem logs
docker compose logs -f postgres
```

#### Dừng Database

```bash
# Dừng containers
docker compose down

# Dừng và xóa volumes (reset database)
docker compose down -v
```

### Prisma ORM

#### Các lệnh Prisma thường dùng

```bash
# Generate Prisma Client
npm run prisma:generate

# Tạo migration mới
npm run prisma:migrate

# Deploy migrations (production)
npm run prisma:migrate:prod

# Mở Prisma Studio (GUI database)
npm run prisma:studio

# Push schema changes (development only)
npm run db:push

# Reset database
npm run db:reset

# Seed database với dữ liệu mẫu
npm run prisma:seed
```

### Database Schema

Database bao gồm các bảng sau:

- **vocabulary**: Lưu trữ từ vựng tiếng Hàn
- **vocab_progress**: Theo dõi tiến trình học (spaced repetition)
- **game_results**: Kết quả các mini game
- **user_stats**: Thống kê người dùng
- **user_settings**: Cài đặt ứng dụng
- **study_sessions**: Lịch sử học tập

### Kết nối Database

```env
DATABASE_URL="postgresql://topik_user:topik_password@localhost:5432/topik_learning_db?schema=public"
```

### PgAdmin

Truy cập PgAdmin tại: `http://localhost:5050`

- Email: `admin@topik.com`
- Password: `admin123`

#### Kết nối đến PostgreSQL từ PgAdmin:

1. Add New Server
2. General > Name: `TOPIK Learning DB`
3. Connection:
   - Host: `postgres` (tên service trong docker-compose)
   - Port: `5432`
   - Database: `topik_learning_db`
   - Username: `topik_user`
   - Password: `topik_password`

## 🔄 CI/CD Workflows

### GitHub Actions

Dự án có 2 workflows:

#### 1. CI/CD Pipeline (`ci-cd.yml`)

Chạy tự động khi push/PR vào `main` hoặc `develop`:

- ✅ Lint và Type Check
- ✅ Build và Test
- ✅ Database Schema Validation
- ✅ Docker Build (chỉ trên main)
- ✅ Security Audit

#### 2. Deploy to Production (`deploy.yml`)

Chạy khi push vào `main` hoặc manual trigger:

- ✅ Build production
- ✅ Database migrations
- ✅ Deploy (cấu hình theo platform)

### Yêu cầu GitHub Secrets

Để workflows hoạt động trong production, cần thêm secrets:

```
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🚀 Development Workflow

### Bắt đầu phát triển

```bash
# 1. Clone repository
git clone <repo-url>
cd korean-topik-learning-app

# 2. Cài đặt dependencies
npm install

# 3. Copy file môi trường
cp .env.example .env

# 4. Khởi động database
docker compose up -d

# 5. Chạy migrations
npm run prisma:migrate

# 6. Seed dữ liệu mẫu
npm run prisma:seed

# 7. Khởi động dev server
npm run dev
```

### Kiểm tra kết nối

Truy cập: `http://localhost:3000/api/health`

Response mẫu:
```json
{
  "status": "success",
  "message": "Database connection successful",
  "data": {
    "vocabularyCount": 5,
    "userStats": { ... },
    "userSettings": { ... }
  }
}
```

## 🔧 Database Migration Flow

### Thêm model mới hoặc sửa schema

```bash
# 1. Sửa file prisma/schema.prisma

# 2. Tạo migration
npx prisma migrate dev --name add_new_feature

# 3. Migration tự động apply và generate client
```

### Production Deployment

```bash
# Apply migrations
npx prisma migrate deploy

# Không sử dụng prisma migrate dev trên production
```

## 📊 API Endpoints

### Health Check
- `GET /api/health` - Kiểm tra kết nối database

### Vocabulary
- `GET /api/vocabulary` - Lấy tất cả từ vựng
- `GET /api/vocabulary?query=안녕` - Tìm kiếm từ vựng
- `POST /api/vocabulary` - Thêm từ vựng mới

## 🐛 Troubleshooting

### Database connection error

```bash
# Kiểm tra container đang chạy
docker compose ps

# Restart database
docker compose restart postgres

# Xem logs
docker compose logs postgres
```

### Prisma Client not generated

```bash
# Regenerate client
npm run prisma:generate
```

### Migration conflicts

```bash
# Reset database (development only)
npm run db:reset
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://topik_user:topik_password@localhost:5432/topik_learning_db` |
| `POSTGRES_USER` | Database username | `topik_user` |
| `POSTGRES_PASSWORD` | Database password | `topik_password` |
| `POSTGRES_DB` | Database name | `topik_learning_db` |
| `PGADMIN_EMAIL` | PgAdmin login email | `admin@topik.com` |
| `PGADMIN_PASSWORD` | PgAdmin password | `admin123` |
| `NODE_ENV` | Environment | `development` |

## 🔒 Security Notes

⚠️ **QUAN TRỌNG**: 

- Đừng commit file `.env` vào git
- Thay đổi mật khẩu mặc định trong production
- Sử dụng secrets management cho CI/CD
- Enable SSL/TLS cho database connection trong production

## 📚 Tài liệu tham khảo

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose](https://docs.docker.com/compose/)
- [GitHub Actions](https://docs.github.com/en/actions)
