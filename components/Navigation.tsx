'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Mic, 
  Trophy, 
  CalendarCheck, 
  User, 
  Newspaper,
  PenTool,
  Camera
} from 'lucide-react';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Trang chủ', href: '/', icon: Home },
  { name: 'Bảng tin', href: '/feed', icon: Newspaper },
  { name: 'Luyện chữ', href: '/handwriting', icon: PenTool },
  { name: 'Camera to Vocab', href: '/camera-vocab', icon: Camera },
  { name: 'Phát âm', href: '/pronunciation', icon: Mic },
  { name: 'Giải đấu', href: '/tournament', icon: Trophy },
  { name: 'Nhiệm vụ hằng tháng', href: '/monthly-tasks', icon: CalendarCheck },
  { name: 'Quản lý thông tin', href: '/profile', icon: User },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-1", className)}>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className = "" }: MobileNavigationProps) {
  const pathname = usePathname();

  // 4 trang chính hiển thị trên mobile navigation
  const mobileNav = [
    navigation[0], // Trang chủ
    navigation[1], // Bảng tin
    navigation[4], // Phát âm
    navigation[5], // Giải đấu
  ];

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50",
      className
    )}>
      <div className="grid grid-cols-4 gap-1 p-2">
        {mobileNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-2 py-2 text-xs font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}