import { getAllSchoolsAction } from "./actions";
import { SchoolsTable } from "./_components/schools-table";

export const dynamic = "force-dynamic";

interface SchoolsPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    name?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function SchoolsPage({ searchParams }: SchoolsPageProps) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "10");
  const sortBy = searchParams.sortBy as "name" | "createdAt" | undefined;

  // Fetch schools
  const schoolsResult = await getAllSchoolsAction({
    page,
    pageSize,
    name: searchParams.name,
    status: searchParams.status,
    sortBy: sortBy || "createdAt",
    sortOrder: (searchParams.sortOrder as "asc" | "desc") || "desc",
  });

  if (!schoolsResult.success || !schoolsResult.data) {
    return <div>Error: {schoolsResult.error || "Unknown error"}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý trường học</h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin các trường học trong hệ thống
        </p>
      </div>

      <SchoolsTable
        data={schoolsResult.data.schools}
        total={schoolsResult.data.total}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
