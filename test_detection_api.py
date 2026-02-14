#!/usr/bin/env python3
"""
Test AI Detection API với ảnh mẫu
"""
import requests
import base64
import json
from pathlib import Path

def test_detection_api():
    """Test /detect endpoint với ảnh từ COCO128"""
    
    # Tìm ảnh mẫu từ COCO128
    coco_images = Path("coco128/images/train2017").glob("*.jpg")
    sample_image = next(coco_images, None)
    
    if not sample_image:
        print("❌ Không tìm thấy ảnh trong coco128/images/train2017/")
        return
    
    print(f"📸 Testing với ảnh: {sample_image.name}")
    
    # Đọc và encode ảnh
    with open(sample_image, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode('utf-8')
    
    # Gửi request đến API
    url = "http://localhost:5001/detect"
    payload = {"image": f"data:image/jpeg;base64,{image_data}"}
    
    print("🔄 Đang gửi request đến AI backend...")
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        
        if result.get('success'):
            objects = result.get('objects', [])
            total = result.get('total_detected', 0)
            
            print(f"\n✅ Detection thành công!")
            print(f"📊 Tổng số đối tượng phát hiện: {total}")
            print(f"📋 Hiển thị top {len(objects)} đối tượng:\n")
            
            for i, obj in enumerate(objects, 1):
                print(f"{i}. {obj['korean']} ({obj['name']})")
                print(f"   📝 Phiên âm: {obj['romanization']}")
                print(f"   🎯 Confidence: {obj['confidence']*100:.1f}%")
                print(f"   📦 Bounding box: {obj['bbox']}")
                print()
            
            # Kiểm tra romanization
            has_roman = all(obj.get('romanization') for obj in objects)
            if has_roman:
                print("✅ Tất cả đối tượng đều có romanization!")
            else:
                print("⚠️  Một số đối tượng thiếu romanization")
                
        else:
            print("❌ Detection failed:", result)
            
    except requests.exceptions.ConnectionError:
        print("❌ Không thể kết nối đến backend!")
        print("💡 Hãy chạy: cd ai-backend && python3 app.py")
    except Exception as e:
        print(f"❌ Lỗi: {e}")

def test_health():
    """Test health endpoint"""
    print("🏥 Kiểm tra health backend...")
    try:
        response = requests.get("http://localhost:5001/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend đang chạy:", response.json())
            return True
        else:
            print("❌ Backend trả về lỗi:", response.status_code)
            return False
    except:
        print("❌ Backend không chạy!")
        return False

def test_vocab_list():
    """Test vocab list endpoint"""
    print("\n📚 Kiểm tra danh sách từ vựng...")
    try:
        response = requests.get("http://localhost:5001/vocab/list", timeout=5)
        data = response.json()
        print(f"✅ Tổng số từ vựng: {data['total']}")
        
        # Hiển thị 5 từ mẫu
        items = list(data['mappings'].items())[:5]
        for eng, kor in items:
            print(f"   {eng:15} -> {kor}")
        print("   ...")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    print("="*60)
    print("🧪 TEST AI DETECTION API")
    print("="*60)
    print()
    
    # Test 1: Health check
    if not test_health():
        print("\n❌ Backend không hoạt động. Dừng test.")
        exit(1)
    
    # Test 2: Vocab list
    test_vocab_list()
    
    # Test 3: Object detection
    print("\n" + "="*60)
    test_detection_api()
    print("="*60)
