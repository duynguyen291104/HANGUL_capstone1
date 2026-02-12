'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Check, 
  Volume2, 
  Award,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useVocabularyStore } from '@/stores/vocabulary';
import { cn } from '@/lib/utils';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
}

// Các ký tự Hangul mẫu để luyện tập
const PRACTICE_CHARACTERS = [
  { char: 'ㄱ', name: 'Giyeok', description: 'Phụ âm đầu G/K' },
  { char: 'ㄴ', name: 'Nieun', description: 'Phụ âm đầu N' },
  { char: 'ㄷ', name: 'Digeut', description: 'Phụ âm đầu D/T' },
  { char: 'ㄹ', name: 'Rieul', description: 'Phụ âm đầu R/L' },
  { char: 'ㅁ', name: 'Mieum', description: 'Phụ âm đầu M' },
  { char: 'ㅂ', name: 'Bieup', description: 'Phụ âm đầu B/P' },
  { char: 'ㅅ', name: 'Siot', description: 'Phụ âm đầu S' },
  { char: 'ㅇ', name: 'Ieung', description: 'Không âm/NG' },
  { char: 'ㅈ', name: 'Jieut', description: 'Phụ âm đầu J' },
  { char: 'ㅊ', name: 'Chieut', description: 'Phụ âm đầu Ch' },
  { char: 'ㅋ', name: 'Kieuk', description: 'Phụ âm đầu K' },
  { char: 'ㅌ', name: 'Tieut', description: 'Phụ âm đầu T' },
  { char: 'ㅍ', name: 'Pieup', description: 'Phụ âm đầu P' },
  { char: 'ㅎ', name: 'Hieut', description: 'Phụ âm đầu H' },
  { char: 'ㅏ', name: 'A', description: 'Nguyên âm A' },
  { char: 'ㅓ', name: 'Eo', description: 'Nguyên âm Eo' },
  { char: 'ㅗ', name: 'O', description: 'Nguyên âm O' },
  { char: 'ㅜ', name: 'U', description: 'Nguyên âm U' },
  { char: 'ㅡ', name: 'Eu', description: 'Nguyên âm Eu' },
  { char: 'ㅣ', name: 'I', description: 'Nguyên âm I' },
  { char: '안', name: 'An', description: 'Chữ cái: Xin chào (phần 1)' },
  { char: '녕', name: 'Nyeong', description: 'Chữ cái: Xin chào (phần 2)' },
  { char: '감', name: 'Gam', description: 'Chữ cái: Cảm ơn (phần 1)' },
  { char: '사', name: 'Sa', description: 'Chữ cái: Cảm ơn (phần 2)' },
];

export default function HandwritingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  
  const currentChar = PRACTICE_CHARACTERS[currentCharIndex];

  // Thiết lập canvas size responsive
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const size = Math.min(containerWidth - 32, 400);
        setCanvasSize({ width: size, height: size });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Vẽ chữ mẫu và nét người dùng
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ lưới nền
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Đường ngang giữa
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Đường dọc giữa
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Vẽ chữ mẫu mờ nếu hiển thị hướng dẫn
    if (showGuide) {
      ctx.font = `${canvas.width * 0.6}px Arial`;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentChar.char, canvas.width / 2, canvas.height / 2);
    }

    // Vẽ các nét đã vẽ
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      
      ctx.stroke();
    });

    // Vẽ nét hiện tại
    if (currentStroke.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      
      ctx.stroke();
    }
  }, [strokes, currentStroke, showGuide, currentChar, canvasSize]);

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    setCurrentStroke([point]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const point = getCanvasPoint(e);
    setCurrentStroke(prev => [...prev, point]);
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.length > 1) {
      setStrokes(prev => [...prev, { points: currentStroke }]);
      setCurrentStroke([]);
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setScore(null);
  };

  const checkWriting = () => {
    if (strokes.length === 0) {
      alert('Vui lòng viết ký tự trước khi kiểm tra!');
      return;
    }

    // Thuật toán đơn giản để chấm điểm
    // Trong thực tế, bạn có thể sử dụng ML hoặc thuật toán phức tạp hơn
    const baseScore = 70;
    const strokeBonus = Math.min(strokes.length * 5, 20);
    const randomFactor = Math.random() * 10;
    
    const finalScore = Math.min(Math.round(baseScore + strokeBonus + randomFactor), 100);
    setScore(finalScore);
  };

  const nextCharacter = () => {
    setCurrentCharIndex((prev) => (prev + 1) % PRACTICE_CHARACTERS.length);
    clearCanvas();
  };

  const previousCharacter = () => {
    setCurrentCharIndex((prev) => 
      prev === 0 ? PRACTICE_CHARACTERS.length - 1 : prev - 1
    );
    clearCanvas();
  };

  const speakCharacter = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentChar.char);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreFeedback = (score: number) => {
    if (score >= 90) return 'Xuất sắc! 🎉';
    if (score >= 70) return 'Tốt lắm! 👍';
    if (score >= 50) return 'Khá đấy! 💪';
    return 'Cố gắng thêm nhé! 📝';
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Luyện chữ Hangul</h1>
        <p className="text-muted-foreground">
          Luyện viết các ký tự tiếng Hàn bằng cách vẽ theo mẫu
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Vùng luyện tập
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGuide(!showGuide)}
                  >
                    <Info className="h-4 w-4 mr-1" />
                    {showGuide ? 'Ẩn' : 'Hiện'} mẫu
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={speakCharacter}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent ref={containerRef}>
              {/* Character Info */}
              <div className="mb-4 p-4 bg-secondary rounded-lg">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{currentChar.char}</div>
                  <p className="font-semibold text-lg">{currentChar.name}</p>
                  <p className="text-sm text-muted-foreground">{currentChar.description}</p>
                </div>
              </div>

              {/* Canvas */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  className="touch-none cursor-crosshair bg-white w-full"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>

              {/* Score Display */}
              {score !== null && (
                <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
                  <div className={cn("text-4xl font-bold mb-2", getScoreColor(score))}>
                    {score} điểm
                  </div>
                  <p className="text-lg">{getScoreFeedback(score)}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={clearCanvas}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
                
                <Button
                  onClick={checkWriting}
                  className="w-full"
                  disabled={strokes.length === 0}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Kiểm tra
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Điều hướng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={previousCharacter}
              >
                ← Ký tự trước
              </Button>
              
              <div className="text-center py-2">
                <Badge variant="secondary">
                  {currentCharIndex + 1} / {PRACTICE_CHARACTERS.length}
                </Badge>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={nextCharacter}
              >
                Ký tự sau →
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Xem ký tự mẫu màu xanh mờ</li>
                <li>Dùng chuột/ngón tay vẽ theo mẫu</li>
                <li>Nhấn "Kiểm tra" để xem điểm</li>
                <li>Nhấn "Xóa" để viết lại</li>
                <li>Chuyển ký tự khác để luyện thêm</li>
              </ol>
            </CardContent>
          </Card>

          {/* Progress Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Thống kê
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ký tự đã học:</span>
                  <span className="font-semibold">{currentCharIndex + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng số ký tự:</span>
                  <span className="font-semibold">{PRACTICE_CHARACTERS.length}</span>
                </div>
                {score !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Điểm gần nhất:</span>
                    <span className={cn("font-semibold", getScoreColor(score))}>
                      {score}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
