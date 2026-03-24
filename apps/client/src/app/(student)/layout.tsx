import { ReactNode } from "react";
import { StudentLayout } from "@/components/mobile/student-layout";
import { ChatSocketProvider } from "@/lib/chat-socket";
import { SocketProvider } from "@/lib/socket-context";

export default function StudentGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SocketProvider>
      <ChatSocketProvider>
        <StudentLayout>{children}</StudentLayout>
      </ChatSocketProvider>
    </SocketProvider>
  );
}
