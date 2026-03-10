"use client";

import { logout } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function ClientLogoutButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => logout()}
      title="Đăng xuất"
    >
      <LogOut className="h-5 w-5" />
    </Button>
  );
}
