"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  notificationCount?: number;
}

export function MobileHeader({
  title,
  showBack = false,
  rightAction,
  notificationCount = 0,
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {/* Left Side */}
        <div className="flex-1">
          {showBack ? (
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <span>←</span>
              Quay lại
            </button>
          ) : (
            title && <h1 className="text-lg font-semibold">{title}</h1>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {rightAction || (
            <Link href="/notifications" className="relative p-2">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
