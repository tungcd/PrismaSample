"use client";

import { ReactNode } from "react";
import { MobileHeader } from "./mobile-header";
import { StudentBottomNav } from "./student-bottom-nav";

interface StudentLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showBottomNav?: boolean;
}

export function StudentLayout({
  children,
  title,
  showBack = false,
  showBottomNav = true,
}: StudentLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <MobileHeader title={title} showBack={showBack} />

      <main className="flex-1 pb-20">{children}</main>

      {showBottomNav && <StudentBottomNav />}
    </div>
  );
}
