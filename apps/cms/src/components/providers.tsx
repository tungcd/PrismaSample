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
    console.log("[SocketConnector CMS] Component mounted");
  }, []);

  useEffect(() => {
    console.log("[SocketConnector CMS] Check connect:", {
      mounted,
      hasConnected: hasConnected.current,
      isConnected,
    });

    if (!mounted || hasConnected.current || isConnected) return;

    const token = getToken();
    console.log("[SocketConnector CMS] Token:", token ? "exists" : "missing");
    
    if (token) {
      console.log("[SocketConnector CMS] Calling connect with token");
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
