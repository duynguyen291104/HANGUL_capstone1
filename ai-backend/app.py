from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import json
from pathlib import Path
import os
import torch

# Set torch to use weights_only=False for YOLO compatibility
os.environ['TORCH_WEIGHTS_ONLY'] = '0'

from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# Load YOLO model and vocab mapping
print("Loading YOLOv8 model...")
# Use weights_only parameter explicitly
import ultralytics.nn.tasks as tasks
original_load = torch.load
torch.load = lambda *args, **kwargs: original_load(*args, **{**kwargs, 'weights_only': False})

model = YOLO('yolov8n.pt')  # nano version for speed

# Restore original torch.load
torch.load = original_load

print("Model loaded successfully!")

# Load Korean vocabulary mapping
with open('vocab_mapping.json', 'r', encoding='utf-8') as f:
    vocab_map = json.load(f)

# Load romanization mapping
with open('romanization.json', 'r', encoding='utf-8') as f:
    roman_map = json.load(f)

def decode_image(image_data):
    """Decode base64 image to OpenCV format"""
    try:
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64
        img_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'AI Backend is running'})

@app.route('/detect', methods=['POST'])
def detect_objects():
    """Object detection endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode image
        img = decode_image(data['image'])
        if img is None:
            return jsonify({'error': 'Failed to decode image'}), 400
        
        # Run YOLO detection
        results = model(img, conf=0.5)  # confidence threshold 50%
        
        # Parse results
        detected_objects = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get class name and confidence
                cls_id = int(box.cls[0])
                class_name = model.names[cls_id]
                confidence = float(box.conf[0])
                
                # Get Korean translation
                korean = vocab_map.get(class_name, class_name)
                romanization = roman_map.get(class_name, '')
                
                # Get bounding box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                detected_objects.append({
                    'name': class_name,
                    'korean': korean,
                    'romanization': romanization,
                    'confidence': round(confidence, 2),
                    'bbox': {
                        'x1': int(x1),
                        'y1': int(y1),
                        'x2': int(x2),
                        'y2': int(y2)
                    }
                })
        
        # Sort by confidence
        detected_objects.sort(key=lambda x: x['confidence'], reverse=True)
        
        return jsonify({
            'success': True,
            'objects': detected_objects[:10],  # Return top 10 objects
            'total_detected': len(detected_objects)
        })
        
    except Exception as e:
        print(f"Error in detection: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/vocab/add', methods=['POST'])
def add_vocab():
    """Add new vocabulary mapping"""
    try:
        data = request.get_json()
        english = data.get('english')
        korean = data.get('korean')
        
        if not english or not korean:
            return jsonify({'error': 'Both english and korean are required'}), 400
        
        vocab_map[english] = korean
        
        # Save to file
        with open('vocab_mapping.json', 'w', encoding='utf-8') as f:
            json.dump(vocab_map, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            'success': True,
            'message': f'Added mapping: {english} -> {korean}'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/vocab/list', methods=['GET'])
def list_vocab():
    """List all vocabulary mappings"""
    return jsonify({
        'total': len(vocab_map),
        'mappings': vocab_map
    })

if __name__ == '__main__':
    print("=" * 50)
    print("AI Backend Server Starting...")
    print("Supported classes:", len(model.names))
    print("Korean vocab mappings:", len(vocab_map))
    print("Romanization mappings:", len(roman_map))
    print("=" * 50)
    app.run(host='0.0.0.0', port=5001, debug=True)
