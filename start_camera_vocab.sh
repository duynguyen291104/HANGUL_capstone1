#!/bin/bash

# ==========================================
# 🚀 START CAMERA-TO-VOCAB SYSTEM
# ==========================================

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   📸 Camera-to-Vocab Detection System                 ║"
echo "║   🇰🇷 AI Object Detection với từ vựng tiếng Hàn      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Đường dẫn
BACKEND_DIR="ai-backend"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR"

# ==========================================
# 1. Kiểm tra dependencies
# ==========================================
echo "🔍 Kiểm tra dependencies..."

# Python packages
if ! python3 -c "import flask" 2>/dev/null; then
    echo "❌ Flask chưa cài đặt!"
    echo "💡 Chạy: pip install flask flask-cors"
    exit 1
fi

if ! python3 -c "import ultralytics" 2>/dev/null; then
    echo "❌ Ultralytics chưa cài đặt!"
    echo "💡 Chạy: pip install ultralytics"
    exit 1
fi

echo "✅ Dependencies OK"

# ==========================================
# 2. Khởi động AI Backend (Flask)
# ==========================================
echo ""
echo "🤖 Khởi động AI Backend..."

# Kiểm tra backend đã chạy chưa
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "✅ Backend đã chạy trên port 5001"
else
    echo "🔄 Đang khởi động Flask backend..."
    cd "$BACKEND_DIR"
    
    # Kill old process if exists
    pkill -f "python3 app.py" 2>/dev/null
    
    # Start backend in background
    nohup python3 app.py > backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for startup
    echo "⏳ Đợi backend khởi động (3 giây)..."
    sleep 3
    
    # Verify
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        echo "✅ Backend started successfully (PID: $BACKEND_PID)"
        echo "📋 Log: $BACKEND_DIR/backend.log"
    else
        echo "❌ Backend không khởi động được!"
        echo "📋 Xem log: tail -f $BACKEND_DIR/backend.log"
        exit 1
    fi
    
    cd "$SCRIPT_DIR"
fi

# ==========================================
# 3. Khởi động Frontend (Next.js)
# ==========================================
echo ""
echo "🌐 Khởi động Frontend..."

# Kiểm tra Next.js đã chạy chưa
if curl -s http://localhost:3000/ > /dev/null 2>&1 || curl -s http://localhost:3001/ > /dev/null 2>&1; then
    echo "✅ Frontend đã chạy"
    FRONTEND_URL=$(curl -s http://localhost:3000/ > /dev/null 2>&1 && echo "http://localhost:3000" || echo "http://localhost:3001")
else
    echo "🔄 Đang khởi động Next.js..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Cài đặt npm packages..."
        npm install
    fi
    
    # Start Next.js in background
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for startup
    echo "⏳ Đợi frontend khởi động (5 giây)..."
    sleep 5
    
    # Determine port
    if curl -s http://localhost:3000/ > /dev/null 2>&1; then
        FRONTEND_URL="http://localhost:3000"
    elif curl -s http://localhost:3001/ > /dev/null 2>&1; then
        FRONTEND_URL="http://localhost:3001"
    else
        echo "❌ Frontend không khởi động được!"
        echo "📋 Xem log: tail -f frontend.log"
        exit 1
    fi
    
    echo "✅ Frontend started successfully (PID: $FRONTEND_PID)"
    echo "📋 Log: frontend.log"
fi

# ==========================================
# 4. Hiển thị thông tin
# ==========================================
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║             ✅ HỆ THỐNG ĐÃ SẴN SÀNG!                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Frontend:  $FRONTEND_URL"
echo "🤖 Backend:   http://localhost:5001"
echo ""
echo "📱 Camera-to-Vocab page:"
echo "   $FRONTEND_URL/camera-vocab"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 HƯỚNG DẪN SỬ DỤNG:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Mở trình duyệt và truy cập:"
echo "    $FRONTEND_URL/camera-vocab"
echo ""
echo "2️⃣  Chọn một trong hai tùy chọn:"
echo "    • Bật Camera - Chụp ảnh trực tiếp"
echo "    • Tải ảnh lên - Upload từ thiết bị"
echo ""
echo "3️⃣  Hệ thống AI sẽ nhận diện và hiển thị:"
echo "    • Tên vật thể bằng tiếng Hàn (Hangul)"
echo "    • Phiên âm La-tinh (Romanization)"
echo "    • Tên tiếng Anh"
echo "    • Độ chính xác (%)"
echo ""
echo "4️⃣  Tương tác với kết quả:"
echo "    🔊 Click để nghe phát âm"
echo "    💾 Lưu từ vào vocabulary"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 THÔNG TIN HỆ THỐNG:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get backend info
VOCAB_COUNT=$(curl -s http://localhost:5001/vocab/list | python3 -c "import sys,json; print(json.load(sys.stdin)['total'])" 2>/dev/null || echo "80")

echo "🤖 AI Model:     YOLOv8 Nano"
echo "📚 Vocabulary:   $VOCAB_COUNT COCO classes"
echo "🇰🇷 Languages:   Korean + Romanization"
echo "🎯 Detection:    Real-time object detection"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TESTING:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Test detection với ảnh mẫu:"
echo "  python3 test_detection_api.py"
echo ""
echo "Test backend trực tiếp:"
echo "  curl http://localhost:5001/health"
echo "  curl http://localhost:5001/vocab/list"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  QUẢN LÝ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Xem log backend:"
echo "  tail -f ai-backend/backend.log"
echo ""
echo "Xem log frontend:"
echo "  tail -f frontend.log"
echo ""
echo "Dừng tất cả services:"
echo "  pkill -f 'python3 app.py'"
echo "  pkill -f 'next dev'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Happy Learning Korean! 🇰🇷"
echo ""
