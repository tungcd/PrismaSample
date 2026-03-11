import { getAllUsersUseCase } from "@/application/use-cases/user/get-all-users.use-case";
import { UsersTable } from "./_components/users-table";

interface UsersPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    email?: string;
    name?: string;
    role?: string;
    phone?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

// Force dynamic rendering to prevent caching issues with pagination
export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : 10,
    email: searchParams.email,
    name: searchParams.name,
    role: searchParams.role,
    phone: searchParams.phone,
    status: searchParams.status,
    sortBy: searchParams.sortBy as any,
    sortOrder: searchParams.sortOrder as any,
  };

  const result = await getAllUsersUseCase.execute(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Người dùng</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin người dùng trong hệ thống
          </p>
        </div>
      </div>

      <UsersTable data={result} />
    </div>
  );
}
