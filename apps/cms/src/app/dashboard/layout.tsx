import { DashboardShell } from "@/components/dashboard/shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware handles authentication redirect
  // SocketProvider is already in root layout
  return <DashboardShell>{children}</DashboardShell>;
}
