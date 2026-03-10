import { redirect } from "next/navigation";

export default function HomePage() {
  // Middleware will handle redirect to /login if not authenticated
  // If user is authenticated, redirect to dashboard
  redirect("/dashboard");
}
