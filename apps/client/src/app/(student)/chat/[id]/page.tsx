"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatRoom } from "@/components/chat/chat-room";
import { useChatSocket } from "@/lib/chat-socket";
import { getToken } from "@/lib/auth-client";
import Link from "next/link";

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = parseInt(params.id as string);
  const { connect, isConnected } = useChatSocket();
  const [mounted, setMounted] = useState(false);

  console.log('[ChatRoomPage] Rendered', {
    paramsId: params.id,
    parsedRoomId: roomId,
    isNaN: isNaN(roomId),
  });

  useEffect(() => {
    console.log('[ChatRoomPage] Mount effect', { roomId });
    setMounted(true);
    // Connect to chat websocket
    const token = getToken();
    if (token && !isConnected) {
      connect(token);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isNaN(roomId)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600">Invalid room ID</p>
          <Link
            href="/chat"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Back to chats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden justify-around">
      <ChatRoom roomId={roomId} />
    </div>
  );
}
