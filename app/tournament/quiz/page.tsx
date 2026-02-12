'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useVocabularyStore } from '@/stores/vocabulary';
import { useProgressStoreNew } from '@/stores/progress-new';
import { Volume2, ArrowLeft, CheckCircle, XCircle, Trophy, Target } from 'lucide-react';
import { SpeechService } from '@/utils/speech';
import { shuffleArray } from '@/lib/utils';
import Link from 'next/link';

type Question = {
  word: { ko: string; vi: string; id: string };
  options: string[];
  correctIndex: number;
};

export default function QuizGamePage() {
  const { vocabulary, loadVocabulary } = useVocabularyStore();
  const { ensureWord, markResult, addGameResult } = useProgressStoreNew();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const [speechService, setSpeechService] = useState<SpeechService | null>(null);

  useEffect(() => {
    // Initialize speech service only on client side
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
      const wrongWords = shuffledVocab
        .filter((w, idx) => idx !== i)
        .slice(0, 3);

      const options = [correctWord.vi, ...wrongWords.map(w => w.vi)];
      const shuffledOptions = shuffleArray(options);
      const correctIndex = shuffledOptions.indexOf(correctWord.vi);

      gameQuestions.push({
        word: correctWord,
        options: shuffledOptions,
        correctIndex,
      });

      ensureWord(correctWord.id);
    }

    setQuestions(gameQuestions);
  };

  const handleAnswer = (selectedIndex: number) => {
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

    // Move to next question after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        // Game finished
        finishGame();
      }
    }, 1500);
  };

  const finishGame = () => {
    const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000);
    const accuracy = Math.round((score / questions.length) * 100);
    
    addGameResult({
      gameType: 'quiz',
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
    }
  };

  if (vocabulary.length < 4) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-4">Cần thêm từ vựng</h2>
            <p className="text-muted-foreground mb-6">
              Bạn cần ít nhất 4 từ vựng để chơi game trắc nghiệm.
            </p>
            <Link href="/camera-vocab">
              <Button>Camera to Vocab</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    const accuracy = Math.round((score / questions.length) * 100);
    const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000);

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <CardTitle className="text-2xl">🎉 Hoàn thành!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{score}/{questions.length}</div>
              <p className="text-muted-foreground">Câu trả lời đúng</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">Độ chính xác</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{timeSpent}s</div>
                <div className="text-sm text-muted-foreground">Thời gian</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} className="flex-1">
                Chơi lại
              </Button>
              <Link href="/tournament" className="flex-1">
                <Button variant="outline" className="w-full">
                  Về giải đấu
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/tournament">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            Câu {currentIndex + 1} / {questions.length}
          </div>
          <Progress value={progress} className="w-32 mt-1" />
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>{score}</span>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-sm text-muted-foreground mb-2">
              Chọn nghĩa đúng của từ:
            </CardTitle>
            <div className="text-5xl font-bold text-primary mb-4">
              {currentQuestion.word.ko}
            </div>
            <Button
              onClick={handlePlayAudio}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Volume2 className="h-4 w-4" />
              Nghe phát âm
            </Button>
          </CardHeader>
        </Card>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = "h-16 text-left justify-start text-lg";
            
            if (isAnswered) {
              if (index === currentQuestion.correctIndex) {
                buttonClass += " bg-green-500 hover:bg-green-500 text-white";
              } else if (index === selectedAnswer && index !== currentQuestion.correctIndex) {
                buttonClass += " bg-red-500 hover:bg-red-500 text-white";
              } else {
                buttonClass += " opacity-50";
              }
            }

            return (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                variant={isAnswered ? "default" : "outline"}
                className={buttonClass}
                disabled={isAnswered}
              >
                <span className="mr-3 font-bold">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}