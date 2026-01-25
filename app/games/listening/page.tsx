'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useVocabularyStore } from '@/stores/vocabulary';
import { useProgressStoreNew } from '@/stores/progress-new';
import { Volume2, ArrowLeft, CheckCircle, XCircle, Trophy, Ear } from 'lucide-react';
import { SpeechService } from '@/utils/speech';
import { shuffleArray } from '@/lib/utils';
import Link from 'next/link';

type Question = {
  word: { ko: string; vi: string; id: string };
  options: string[];
  correctIndex: number;
};

export default function ListeningGamePage() {
  const { vocabulary, loadVocabulary } = useVocabularyStore();
  const { ensureWord, markResult, addGameResult } = useProgressStoreNew();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [speechService, setSpeechService] = useState<SpeechService | null>(null);

  useEffect(() => {
    setSpeechService(new SpeechService());
    loadVocabulary();
  }, [loadVocabulary]);

  useEffect(() => {
    if (vocabulary.length >= 4) {
      generateQuestions();
    }
  }, [vocabulary]);

  const generateQuestions = () => {
    if (vocabulary.length < 4) return;

    const gameQuestions: Question[] = [];
    const shuffledVocab = shuffleArray([...vocabulary]);
    const numQuestions = Math.min(10, shuffledVocab.length);

    for (let i = 0; i < numQuestions; i++) {
      const correctWord = shuffledVocab[i];
      const otherWords = shuffledVocab
        .filter(word => word.id !== correctWord.id)
        .slice(0, 3);

      const options = shuffleArray([correctWord.vi, ...otherWords.map(w => w.vi)]);
      const correctIndex = options.indexOf(correctWord.vi);

      gameQuestions.push({
        word: correctWord,
        options,
        correctIndex
      });

      ensureWord(correctWord.id);
    }

    setQuestions(gameQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsAnswered(false);
    setHasPlayedAudio(false);
  };

  const handleAnswerSelect = (selectedIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(selectedIndex);
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      setScore(score + 1);
      markResult(currentQuestion.word.id, 3, true);
    } else {
      markResult(currentQuestion.word.id, 0, false);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setHasPlayedAudio(false);
        // Auto-play audio for next question
        setTimeout(() => handlePlayAudio(), 500);
      } else {
        finishGame();
      }
    }, 1500);
  };

  const finishGame = () => {
    const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000);
    const accuracy = Math.round((score / questions.length) * 100);
    
    addGameResult({
      gameType: 'listening',
      score: score * 100,
      correctAnswers: score,
      totalQuestions: questions.length,
      timeSpent,
    });

    setShowResult(true);
  };

  const handlePlayAudio = () => {
    if (questions[currentIndex] && speechService) {
      speechService.speak(questions[currentIndex].word.ko);
      setHasPlayedAudio(true);
    }
  };

  // Auto-play audio when question loads
  useEffect(() => {
    if (questions.length > 0 && !hasPlayedAudio && speechService) {
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, questions, hasPlayedAudio, speechService]);

  if (vocabulary.length < 4) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Ear className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-4">Cần thêm từ vựng</h2>
            <p className="text-muted-foreground mb-6">
              Bạn cần ít nhất 4 từ vựng để chơi game nghe.
            </p>
            <Link href="/import">
              <Button>Thêm từ vựng</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Hoàn thành!</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Điểm số:</span>
                <span className="font-bold">{score}/{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Độ chính xác:</span>
                <span className="font-bold">{accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span>XP nhận được:</span>
                <span className="font-bold text-green-600">+{score * 100}</span>
              </div>
            </div>
            <div className="space-y-3">
              <Button onClick={() => {
                generateQuestions();
                setScore(0);
              }} className="w-full">
                Chơi lại
              </Button>
              <Link href="/games">
                <Button variant="outline" className="w-full">
                  Về trang games
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Đang tải câu hỏi...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/games">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-semibold">Game Nghe</h1>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1}/{questions.length} - Điểm: {score}
            </p>
          </div>
          <div className="w-20"></div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6 animate-slide-up">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-3">
              <Ear className="h-6 w-6 text-purple-600" />
              Nghe và chọn nghĩa đúng
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* Audio Button */}
            <div className="flex justify-center">
              <Button
                onClick={handlePlayAudio}
                size="lg"
                className="h-20 w-20 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!speechService}
              >
                <Volume2 className="h-8 w-8" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {hasPlayedAudio ? "Nhấn để nghe lại" : "Nhấn để nghe từ"}
            </p>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-3 mt-6">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctIndex;
                const isWrong = isSelected && !isCorrect;

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                    variant={isSelected ? "default" : "outline"}
                    className={`
                      h-12 text-left justify-start transition-all duration-300
                      ${isAnswered && isCorrect ? 'bg-green-100 border-green-500 text-green-700' : ''}
                      ${isAnswered && isWrong ? 'bg-red-100 border-red-500 text-red-700' : ''}
                      ${!isAnswered ? 'hover:bg-purple-50 hover:border-purple-300' : ''}
                    `}
                  >
                    <span className="flex items-center gap-3">
                      {isAnswered && isCorrect && <CheckCircle className="h-5 w-5" />}
                      {isAnswered && isWrong && <XCircle className="h-5 w-5" />}
                      {option}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}