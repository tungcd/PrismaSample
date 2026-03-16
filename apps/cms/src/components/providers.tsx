"use client";

import { Toaster } from "sonner";
import { SocketProvider, useSocket } from "@/lib/socket-context";
import { getToken } from "@/lib/auth-client";
import { useEffect, useState, useRef } from "react";

function SocketConnector() {
  const { connect, isConnected } = useSocket();
  const [mounted, setMounted] = useState(false);
  const hasConnected = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || hasConnected.current || isConnected) return;

    const token = getToken();
    if (token) {
      console.log("[SocketConnector] Auto-connecting with token");
      hasConnected.current = true;
      connect(token);
    }
  }, [mounted, connect, isConnected]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <SocketConnector />
      {children}
      <Toaster position="top-right" richColors />
    </SocketProvider>
  );
}
