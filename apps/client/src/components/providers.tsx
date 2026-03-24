"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { SocketProvider, useSocket } from "@/lib/socket-context";
import { getToken } from "@/lib/auth-client";

interface ProvidersProps {
  children: ReactNode;
}

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
      hasConnected.current = true;
      connect(token);
    }
  }, [mounted, connect, isConnected]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <SocketConnector />
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            unstyled: false,
            classNames: {
              error: "error-toast",
              success: "success-toast",
              warning: "warning-toast",
              info: "info-toast",
            },
          }}
        />
      </SocketProvider>
    </QueryClientProvider>
  );
}
