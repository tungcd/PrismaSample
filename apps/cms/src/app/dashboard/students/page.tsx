import { getAllStudentsUseCase } from "@/application/use-cases/student/get-all-students.use-case";
import { getAllSchools } from "@/app/actions/get-schools.action";
import { StudentsTable } from "./_components/students-table";

interface StudentsPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    name?: string;
    grade?: string;
    school?: string;
    cardNumber?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

// Force dynamic rendering to prevent caching issues with pagination
export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: StudentsPageProps) {
  const params = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : 10,
    name: searchParams.name,
    grade: searchParams.grade,
    school: searchParams.school,
    cardNumber: searchParams.cardNumber,
    status: searchParams.status,
    sortBy: searchParams.sortBy as any,
    sortOrder: searchParams.sortOrder as any,
  };

  const [result, schools] = await Promise.all([
    getAllStudentsUseCase.execute(params),
    getAllSchools(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Học sinh</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin học sinh trong hệ thống
          </p>
        </div>
      </div>

      <StudentsTable data={result} schools={schools} />
    </div>
  );
}
