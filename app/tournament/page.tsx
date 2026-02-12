'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Gamepad2, Volume2, Target, Clock, Zap, CheckCircle, Keyboard, Shuffle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const games = [
  {
    id: 'quiz',
    title: 'Trắc nghiệm',
    description: 'Chọn nghĩa đúng cho từ tiếng Hàn',
    icon: Target,
    color: 'from-blue-500 to-purple-600',
    href: '/tournament/quiz',
    available: true,
  },
  {
    id: 'listening',
    title: 'Luyện nghe',
    description: 'Nghe và chọn nghĩa đúng của từ vựng',
    icon: Volume2,
    color: 'from-purple-500 to-pink-600',
    href: '/tournament/listening',
    available: true,
  },
  {
    id: 'typing',
    title: 'Gõ từ',
    description: 'Nhìn nghĩa và gõ từ tiếng Hàn tương ứng',
    icon: Keyboard,
    color: 'from-indigo-500 to-blue-600',
    href: '/tournament/typing',
    available: true,
  },
  {
    id: 'matching',
    title: 'Ghép đôi',
    description: 'Ghép từ tiếng Hàn với nghĩa tiếng Việt',
    icon: Shuffle,
    color: 'from-green-500 to-emerald-600',
    href: '/tournament/matching',
    available: true,
  },
  {
    id: 'speed',
    title: 'Tốc độ',
    description: 'Trả lời nhanh trong 60 giây để ghi điểm cao',
    icon: Zap,
    color: 'from-orange-500 to-red-600',
    href: '/tournament/speed',
    available: true,
  },
];

export default function TournamentPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          🏆 Giải đấu
        </h1>
        <p className="text-muted-foreground">
          Thi đấu và thử thách bản thân qua các mini game
        </p>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const IconComponent = game.icon;
          
          return (
            <Card key={game.id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              
              <CardHeader className="relative">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center mb-4`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                
                <CardTitle className="text-xl">{game.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{game.description}</p>
              </CardHeader>
              
              <CardContent className="relative">
                <Link href={game.href}>
                  <Button className="w-full">
                    Chơi ngay
                  </Button>
                </Link>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Điểm cao nhất</span>
                    <span className="font-semibold">0</span>
                  </div>
                    <Progress value={0} className="h-2" />
                  </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Thống kê game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Game đã chơi</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-muted-foreground">Điểm tổng</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">0%</div>
                <div className="text-sm text-muted-foreground">Tỷ lệ đúng</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-muted-foreground">Chuỗi thắng</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}