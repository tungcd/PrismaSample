import { SettingsContent } from "./_components/settings-content";
import { getUserFromDBAction } from "./actions";
import { redirect } from "next/navigation";

// ISR: Cache for 300 seconds (settings rarely change)
export const revalidate = 300;

export default async function SettingsPage() {
  // Fetch user data from database (not from JWT)
  const result = await getUserFromDBAction();

  if (!result.success || !result.data) {
    redirect("/login");
  }

  const user = result.data;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin cá nhân và cài đặt hệ thống
        </p>
      </div>

      <SettingsContent user={user} />
    </div>
  );
}
