import { ReactNode } from "react";
import { ChatSocketProvider } from "@/lib/chat-socket";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <ChatSocketProvider>{children}</ChatSocketProvider>;
}
