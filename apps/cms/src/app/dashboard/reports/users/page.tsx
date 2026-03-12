"use client";

import { useEffect, useState } from "react";
import { UserSpendingTable } from "@/components/reports/user-spending-table";
import { getUserSpendingAction } from "../actions";
import { UserSpendingEntity } from "@/domain/entities/report.entity";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserSpendingPage() {
  const [users, setUsers] = useState<UserSpendingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<"PARENT" | "STUDENT" | "ALL">("ALL");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params =
        userType === "ALL" ? { limit: 20 } : { limit: 20, userType };
      const result = await getUserSpendingAction(params);

      if (!result.success) {
        throw new Error(result.error);
      }

      setUsers(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userType]);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Báo cáo chi tiêu khách hàng
          </h2>
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Báo cáo chi tiêu khách hàng
          </h2>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Báo cáo chi tiêu khách hàng
        </h2>
        <Select
          value={userType}
          onValueChange={(value) =>
            setUserType(value as "PARENT" | "STUDENT" | "ALL")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="PARENT">Phụ huynh</SelectItem>
            <SelectItem value="STUDENT">Học sinh</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {users.length > 0 && <UserSpendingTable users={users} />}
    </div>
  );
}
