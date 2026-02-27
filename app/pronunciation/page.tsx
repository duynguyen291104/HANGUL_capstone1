'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Volume2, ArrowLeft, CheckCircle, XCircle, Mic, Square } from 'lucide-react';
import Link from 'next/link';

// Sample vocabulary data
const sampleVocabulary = [
  { id: '1', ko: '안녕하세요', roman: 'annyeonghaseyo', vi: 'Xin chào' },
  { id: '2', ko: '감사합니다', roman: 'gamsahamnida', vi: 'Cảm ơn' },
  { id: '3', ko: '사랑해요', roman: 'saranghaeyo', vi: 'Tôi yêu bạn' },
  { id: '4', ko: '미안해요', roman: 'mianhaeyo', vi: 'Xin lỗi' },
  { id: '5', ko: '괜찮아요', roman: 'gwaenchanayo', vi: 'Không sao' },
  { id: '6', ko: '네', roman: 'ne', vi: 'Vâng/Có' },
  { id: '7', ko: '아니요', roman: 'aniyo', vi: 'Không' },
  { id: '8', ko: '좋아요', roman: 'johayo', vi: 'Tốt/Thích' },
  { id: '9', ko: '맛있어요', roman: 'masisseoyo', vi: 'Ngon' },
  { id: '10', ko: '아름다워요', roman: 'areumdawoyo', vi: 'Đẹp' },
  { id: '11', ko: '학생', roman: 'haksaeng', vi: 'Học sinh' },
  { id: '12', ko: '선생님', roman: 'seonsaengnim', vi: 'Giáo viên' },
  { id: '13', ko: '친구', roman: 'chingu', vi: 'Bạn bè' },
  { id: '14', ko: '가족', roman: 'gajok', vi: 'Gia đình' },
  { id: '15', ko: '집', roman: 'jip', vi: 'Nhà' },
  { id: '16', ko: '학교', roman: 'hakgyo', vi: 'Trường học' },
  { id: '17', ko: '음식', roman: 'eumsik', vi: 'Đồ ăn' },
  { id: '18', ko: '물', roman: 'mul', vi: 'Nước' },
  { id: '19', ko: '커피', roman: 'keopi', vi: 'Cà phê' },
  { id: '20', ko: '차', roman: 'cha', vi: 'Trà' },
];

type RecordingState = 'idle' | 'recording' | 'processing' | 'completed';

export default function PronunciationPage() {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Initialize Web Speech API for Korean recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        checkPronunciation(result);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setRecordingState('idle');
        setFeedback('❌ Không thể nhận diện giọng nói. Vui lòng thử lại.');
      };
      
      recognitionRef.current = recognition;
    }

    // Initialize Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = new SpeechSynthesisUtterance();
      synthRef.current.lang = 'ko-KR';
      synthRef.current.rate = 0.8;
    }
  }, []);

  const currentWord = sampleVocabulary[currentIndex];

  const checkPronunciation = (spokenText: string) => {
    setRecordingState('processing');
    
    const normalizedSpoken = spokenText.trim().toLowerCase().replace(/\s+/g, '');
    const normalizedExpected = currentWord.ko.trim().toLowerCase().replace(/\s+/g, '');
    
    // Calculate similarity
    let matches = 0;
    const maxLen = Math.max(normalizedSpoken.length, normalizedExpected.length);
    
    for (let i = 0; i < Math.min(normalizedSpoken.length, normalizedExpected.length); i++) {
      if (normalizedSpoken[i] === normalizedExpected[i]) {
        matches++;
      }
    }
    
    const similarity = maxLen > 0 ? (matches / maxLen) * 100 : 0;
    
    setTimeout(() => {
      const finalAccuracy = Math.round(similarity);
      setAccuracy(finalAccuracy);
      setRecordingState('completed');
      
      if (similarity >= 80) {
        setFeedback('🎉 Tuyệt vời! Phát âm chính xác!');
      } else if (similarity >= 60) {
        setFeedback('👍 Khá tốt! Cần luyện tập thêm một chút.');
      } else if (similarity >= 40) {
        setFeedback('💪 Cố gắng lên! Nghe kỹ và thử lại nhé.');
      } else {
        setFeedback('🎯 Hãy nghe kỹ cách phát âm và thử lại.');
      }
    }, 800);
  };

  const handleRecordToggle = async () => {
    if (recordingState === 'idle') {
      try {
        setTranscript('');
        setAccuracy(null);
        setFeedback('');
        
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setRecordingState('recording');
        } else {
          alert('⚠️ Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome hoặc Edge.');
        }
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('❌ Không thể khởi động nhận diện giọng nói. Vui lòng cho phép quyền microphone.');
      }
    } else if (recordingState === 'recording') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setRecordingState('processing');
    }
  };

  const handlePlayAudio = () => {
    if (synthRef.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      synthRef.current.text = currentWord.ko;
      window.speechSynthesis.speak(synthRef.current);
    }
  };

  const handleNext = () => {
    if (accuracy !== null) {
      const wasCorrect = accuracy >= 60;
      setSessionStats(prev => ({
        correct: prev.correct + (wasCorrect ? 1 : 0),
        wrong: prev.wrong + (wasCorrect ? 0 : 1),
      }));
    }
    
    setRecordingState('idle');
    setTranscript('');
    setAccuracy(null);
    setFeedback('');
    
    if (currentIndex < sampleVocabulary.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
  };

  const progressPercentage = ((currentIndex + 1) / sampleVocabulary.length) * 100;

  // Wait for client-side mounting
  if (!mounted) {
    return null;
  }

  // Completion state
  if (currentIndex >= sampleVocabulary.length && sessionStats.correct + sessionStats.wrong > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-teal-50">
        <Card className="w-full max-w-md border-2 border-green-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mb-4">
              <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600">
              🎉 Hoàn thành xuất sắc!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-100 rounded-xl p-4 border-2 border-green-300">
                <div className="text-3xl font-bold text-green-700">{sessionStats.correct}</div>
                <div className="text-sm text-green-600 font-medium">Đúng</div>
              </div>
              <div className="bg-red-100 rounded-xl p-4 border-2 border-red-300">
                <div className="text-3xl font-bold text-red-700">{sessionStats.wrong}</div>
                <div className="text-sm text-red-600 font-medium">Sai</div>
              </div>
            </div>
            
            <div className="space-y-3 pt-4">
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-6"
                onClick={() => {
                  setCurrentIndex(0);
                  setSessionStats({ correct: 0, wrong: 0 });
                }}
              >
                Luyện lại
              </Button>
              
              <Link href="/">
                <Button variant="outline" className="w-full py-6">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về trang chủ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-md">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-700">
                Từ {currentIndex + 1}/{sampleVocabulary.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2.5" />
          </div>
          
          <div className="flex gap-3 text-sm font-bold">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
              <CheckCircle className="h-4 w-4" />
              {sessionStats.correct}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full">
              <XCircle className="h-4 w-4" />
              {sessionStats.wrong}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Instruction */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🎤 Luyện phát âm tiếng Hàn
          </h2>
          <p className="text-gray-600">
            Nhấn vào micro và đọc theo từ dưới đây
          </p>
        </div>

        {/* Word Card */}
        <Card className="border-4 border-purple-200 shadow-2xl bg-white">
          <CardContent className="p-8 space-y-6">
            {/* Korean Word */}
            <div className="text-center space-y-4">
              <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
                {currentWord.ko}
              </div>
              
              {/* Romanization */}
              <div className="text-3xl font-semibold text-purple-600">
                {currentWord.roman}
              </div>
              
              {/* Vietnamese meaning */}
              <div className="text-xl text-gray-600 font-medium">
                {currentWord.vi}
              </div>
            </div>

            {/* Play Audio Button */}
            <div className="flex justify-center">
              <Button
                onClick={handlePlayAudio}
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-lg font-bold border-2 border-blue-400 hover:bg-blue-50 hover:border-blue-600 transition-all hover:scale-105"
              >
                <Volume2 className="h-6 w-6 mr-2 text-blue-600" />
                Nghe phát âm
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Microphone Button */}
        <div className="flex flex-col items-center space-y-4">
          <Button
            onClick={handleRecordToggle}
            disabled={recordingState === 'processing'}
            size="lg"
            className={`
              rounded-full w-32 h-32 shadow-2xl transition-all duration-300 text-white
              ${recordingState === 'recording' 
                ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse scale-110' 
                : recordingState === 'processing'
                ? 'bg-gradient-to-br from-gray-400 to-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 hover:from-purple-600 hover:via-purple-700 hover:to-pink-700 hover:scale-110'
              }
            `}
          >
            {recordingState === 'processing' ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              </div>
            ) : recordingState === 'recording' ? (
              <Square className="h-14 w-14" />
            ) : (
              <Mic className="h-14 w-14" />
            )}
          </Button>
          
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700">
              {recordingState === 'idle' && '🎙️ Nhấn micro để ghi âm'}
              {recordingState === 'recording' && '🔴 Đang ghi âm... Nhấn để dừng'}
              {recordingState === 'processing' && '⏳ Đang phân tích...'}
              {recordingState === 'completed' && '✅ Hoàn thành!'}
            </p>
          </div>
        </div>

        {/* Transcript */}
        {transcript && (
          <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6 text-center space-y-2">
              <p className="text-sm font-semibold text-blue-700 uppercase">Bạn đã nói:</p>
              <p className="text-4xl font-bold text-gray-800">{transcript}</p>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {accuracy !== null && (
          <Card className={`border-4 shadow-xl ${
            accuracy >= 80 ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100' :
            accuracy >= 60 ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100' :
            accuracy >= 40 ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100' :
            'border-red-400 bg-gradient-to-br from-red-50 to-red-100'
          }`}>
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-8xl font-bold" style={{
                color: accuracy >= 80 ? '#16a34a' :
                       accuracy >= 60 ? '#ca8a04' :
                       accuracy >= 40 ? '#ea580c' : '#dc2626'
              }}>
                {accuracy}%
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {feedback}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Button */}
        {recordingState === 'completed' && (
          <Button
            onClick={handleNext}
            size="lg"
            className="w-full bg-gradient-to-r from-green-500 via-green-600 to-teal-600 hover:from-green-600 hover:via-green-700 hover:to-teal-700 text-white font-bold py-8 text-xl shadow-xl hover:scale-105 transition-all"
          >
            Từ tiếp theo →
          </Button>
        )}

        {/* Skip Button */}
        {recordingState === 'idle' && (
          <Button
            onClick={handleNext}
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700 font-medium"
          >
            Bỏ qua →
          </Button>
        )}
      </div>

      {/* Bottom spacing */}
      <div className="h-12"></div>
    </div>
  );
}
