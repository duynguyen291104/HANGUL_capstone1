'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  X, 
  Loader2, 
  BookOpen,
  Volume2,
  Download,
  RefreshCw,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { useVocabularyStore } from '@/stores/vocabulary';

interface DetectedObject {
  name: string;
  korean: string;
  romanization: string;
  confidence: number;
  category: string;
}

// Dữ liệu mẫu để mô phỏng nhận diện đối tượng
const SAMPLE_OBJECTS: Record<string, DetectedObject> = {
  'cup': {
    name: 'Cup',
    korean: '컵',
    romanization: 'keop',
    confidence: 0.95,
    category: 'Đồ dùng'
  },
  'book': {
    name: 'Book',
    korean: '책',
    romanization: 'chaek',
    confidence: 0.92,
    category: 'Văn phòng phẩm'
  },
  'phone': {
    name: 'Phone',
    korean: '전화기',
    romanization: 'jeonhwagi',
    confidence: 0.88,
    category: 'Điện tử'
  },
  'apple': {
    name: 'Apple',
    korean: '사과',
    romanization: 'sagwa',
    confidence: 0.96,
    category: 'Trái cây'
  },
  'laptop': {
    name: 'Laptop',
    korean: '노트북',
    romanization: 'noteubuk',
    confidence: 0.90,
    category: 'Điện tử'
  },
  'water': {
    name: 'Water',
    korean: '물',
    romanization: 'mul',
    confidence: 0.93,
    category: 'Đồ uống'
  },
  'chair': {
    name: 'Chair',
    korean: '의자',
    romanization: 'uija',
    confidence: 0.91,
    category: 'Đồ nội thất'
  },
  'pen': {
    name: 'Pen',
    korean: '펜',
    romanization: 'pen',
    confidence: 0.94,
    category: 'Văn phòng phẩm'
  },
  'table': {
    name: 'Table',
    korean: '테이블',
    romanization: 'teibeul',
    confidence: 0.89,
    category: 'Đồ nội thất'
  },
  'bag': {
    name: 'Bag',
    korean: '가방',
    romanization: 'gabang',
    confidence: 0.87,
    category: 'Phụ kiện'
  }
};

export default function CameraVocabPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  const { addVocabulary } = useVocabularyStore();

  // Cleanup camera stream khi component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
        setCapturedImage(null);
        setUploadedImage(null);
        setDetectedObjects([]);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập!');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    stopCamera();
    
    // Xử lý nhận diện đối tượng
    processImage(imageData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setUploadedImage(imageData);
      setCapturedImage(null);
      
      // Xử lý nhận diện đối tượng
      processImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setDetectedObjects([]);

    // Mô phỏng quá trình nhận diện (thay thế bằng API thật trong production)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Random chọn 2-4 đối tượng từ danh sách mẫu
    const objectKeys = Object.keys(SAMPLE_OBJECTS);
    const numObjects = Math.floor(Math.random() * 3) + 2; // 2-4 objects
    const randomObjects: DetectedObject[] = [];

    for (let i = 0; i < numObjects; i++) {
      const randomKey = objectKeys[Math.floor(Math.random() * objectKeys.length)];
      const obj = SAMPLE_OBJECTS[randomKey];
      if (!randomObjects.find(o => o.korean === obj.korean)) {
        randomObjects.push({
          ...obj,
          confidence: Math.random() * 0.2 + 0.8 // 80-100%
        });
      }
    }

    setDetectedObjects(randomObjects);
    setIsProcessing(false);
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const saveToVocabulary = (obj: DetectedObject) => {
    // Thêm từ vào vocabulary store
    addVocabulary([{
      id: `camera-${Date.now()}-${obj.korean}`,
      ko: obj.korean,
      vi: obj.name,
      tags: [obj.category, 'camera-scan'],
      addedAt: Date.now()
    }]);

    setSavedWords(prev => new Set(prev).add(obj.korean));
    
    // Hiển thị thông báo
    alert(`Đã lưu "${obj.korean}" vào từ điển của bạn!`);
  };

  const resetAll = () => {
    setCapturedImage(null);
    setUploadedImage(null);
    setDetectedObjects([]);
    setIsProcessing(false);
    stopCamera();
  };

  const currentImage = capturedImage || uploadedImage;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Camera to Vocab</h1>
        <p className="text-muted-foreground">
          Chụp ảnh hoặc tải lên hình ảnh để nhận diện vật thể và học từ vựng tiếng Hàn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera/Upload Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Hình ảnh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Preview or Image Display */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : currentImage ? (
                  <img
                    src={currentImage}
                    alt="Captured or uploaded"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                      <p>Chưa có hình ảnh</p>
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-2" />
                      <p>Đang nhận diện đối tượng...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Canvas for capture (hidden) */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {!isCameraActive && !currentImage && (
                  <>
                    <Button onClick={startCamera} className="w-full">
                      <Camera className="mr-2 h-4 w-4" />
                      Bật Camera
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Tải ảnh lên
                    </Button>
                  </>
                )}

                {isCameraActive && (
                  <>
                    <Button onClick={capturePhoto} className="w-full">
                      <Camera className="mr-2 h-4 w-4" />
                      Chụp ảnh
                    </Button>
                    
                    <Button variant="outline" onClick={stopCamera} className="w-full">
                      <X className="mr-2 h-4 w-4" />
                      Hủy
                    </Button>
                  </>
                )}

                {currentImage && (
                  <>
                    <Button onClick={resetAll} variant="outline" className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Thử lại
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Ảnh khác
                    </Button>
                  </>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Instructions */}
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <p className="font-semibold mb-1">💡 Hướng dẫn:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Chụp ảnh vật thể rõ ràng</li>
                  <li>Đảm bảo đủ ánh sáng</li>
                  <li>Vật thể nằm ở giữa khung hình</li>
                  <li>Hoặc tải ảnh có sẵn từ thiết bị</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Kết quả nhận diện
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detectedObjects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-16 w-16 mx-auto mb-3 opacity-50" />
                  <p>Chưa có kết quả</p>
                  <p className="text-sm mt-1">Chụp hoặc tải ảnh lên để bắt đầu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {detectedObjects.map((obj, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl font-bold">{obj.korean}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => speakWord(obj.korean)}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-1">
                            {obj.romanization}
                          </p>
                          
                          <p className="font-medium">{obj.name}</p>
                        </div>

                        <Badge variant="secondary">
                          {Math.round(obj.confidence * 100)}%
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <Badge variant="outline">{obj.category}</Badge>
                        
                        <Button
                          size="sm"
                          variant={savedWords.has(obj.korean) ? "secondary" : "default"}
                          onClick={() => saveToVocabulary(obj)}
                          disabled={savedWords.has(obj.korean)}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          {savedWords.has(obj.korean) ? 'Đã lưu' : 'Lưu từ'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detectedObjects.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm">
                  <p className="font-semibold text-green-800 mb-1">
                    ✨ Tìm thấy {detectedObjects.length} đối tượng!
                  </p>
                  <p className="text-green-700">
                    Nhấn "Lưu từ" để thêm vào từ điển của bạn
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          {savedWords.size > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Thống kê</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Từ đã lưu:</span>
                  <span className="text-2xl font-bold">{savedWords.size}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
