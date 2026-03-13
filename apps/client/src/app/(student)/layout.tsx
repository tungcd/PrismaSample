import { ReactNode } from "react";
import { StudentLayout } from "@/components/mobile/student-layout";

export default function StudentGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <StudentLayout>{children}</StudentLayout>;
}
