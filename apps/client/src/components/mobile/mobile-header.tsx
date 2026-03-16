"use client";

import { ReactNode, useEffect, useState } from "react";
import { NotificationBell } from "@/components/notification-bell";
import { getToken } from "@/lib/auth-client";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}

export function MobileHeader({
  title,
  showBack = false,
  rightAction,
}: MobileHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setToken(getToken());
  }, []);

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
          {rightAction ||
            (mounted && token && <NotificationBell token={token} />)}
        </div>
      </div>
    </header>
  );
}
