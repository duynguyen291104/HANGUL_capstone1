'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Trophy, 
  BookOpen, 
  Users, 
  Star,
  Calendar,
  Target,
  Flame
} from 'lucide-react';
import Link from 'next/link';

interface FeedItem {
  id: string;
  type: 'achievement' | 'tip' | 'challenge' | 'community';
  title: string;
  description: string;
  timestamp: Date;
  icon: any;
  color: string;
}

export default function FeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    // Tạo dữ liệu mẫu cho bảng tin
    const sampleFeed: FeedItem[] = [
      {
        id: '1',
        type: 'achievement',
        title: 'Hoàn thành 7 ngày liên tiếp!',
        description: 'Chúc mừng! Bạn đã duy trì học tập 7 ngày liên tiếp. Tiếp tục phát huy!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        icon: Flame,
        color: 'text-orange-500'
      },
      {
        id: '2',
        type: 'tip',
        title: 'Mẹo học từ vựng hiệu quả',
        description: 'Hãy thử ghép từ vựng mới với hình ảnh hoặc câu chuyện để ghi nhớ lâu hơn!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        icon: BookOpen,
        color: 'text-blue-500'
      },
      {
        id: '3',
        type: 'challenge',
        title: 'Thử thách tháng này',
        description: 'Học 100 từ vựng mới trong tháng 2. Bạn đã hoàn thành 45/100!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        icon: Target,
        color: 'text-green-500'
      },
      {
        id: '4',
        type: 'community',
        title: 'Xu hướng học tập',
        description: 'Chủ đề "Ẩm thực Hàn Quốc" đang được nhiều người học nhất tuần này!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
        icon: TrendingUp,
        color: 'text-purple-500'
      },
      {
        id: '5',
        type: 'achievement',
        title: 'Lên cấp độ mới!',
        description: 'Bạn đã đạt Level 5 trong hệ thống học tập. Tiếp tục cố gắng!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        icon: Trophy,
        color: 'text-yellow-500'
      },
      {
        id: '6',
        type: 'tip',
        title: 'Luyện phát âm mỗi ngày',
        description: 'Dành 10 phút mỗi ngày để luyện phát âm sẽ giúp bạn tiến bộ nhanh hơn!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36),
        icon: Star,
        color: 'text-pink-500'
      }
    ];

    setFeedItems(sampleFeed);
  }, []);

  const formatTimestamp = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const getTypeLabel = (type: FeedItem['type']) => {
    const labels = {
      achievement: { text: 'Thành tích', variant: 'default' as const },
      tip: { text: 'Mẹo học tập', variant: 'secondary' as const },
      challenge: { text: 'Thử thách', variant: 'default' as const },
      community: { text: 'Cộng đồng', variant: 'secondary' as const }
    };
    return labels[type];
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Bảng tin</h1>
        <p className="text-muted-foreground">
          Cập nhật thành tích, mẹo học tập và thông tin mới nhất
        </p>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chuỗi học tập</p>
                <p className="text-2xl font-bold">7 ngày</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Từ vựng</p>
                <p className="text-2xl font-bold">234 từ</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Xếp hạng</p>
                <p className="text-2xl font-bold">Top 15%</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feed Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedItems.map((item) => {
            const Icon = item.icon;
            const typeInfo = getTypeLabel(item.type);
            
            return (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className={`flex-shrink-0 ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <Badge variant={typeInfo.variant} className="flex-shrink-0">
                      {typeInfo.text}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(item.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link href="/handwriting">
          <Button variant="outline" className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />
            Luyện chữ
          </Button>
        </Link>
        
        <Link href="/pronunciation">
          <Button variant="outline" className="w-full">
            <Star className="mr-2 h-4 w-4" />
            Phát âm
          </Button>
        </Link>
      </div>
    </div>
  );
}
