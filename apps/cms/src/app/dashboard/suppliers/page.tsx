import { getAllSuppliersAction } from "./actions";
import { SuppliersTable } from "./_components/suppliers-table";

// ISR: Cache for 300 seconds (suppliers rarely change)
export const revalidate = 300;

interface SuppliersPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    name?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function SuppliersPage({
  searchParams,
}: SuppliersPageProps) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "10");
  const name = searchParams.name;
  const status = searchParams.status;
  const sortBy = searchParams.sortBy as "name" | "createdAt";
  const sortOrder = searchParams.sortOrder as "asc" | "desc";

  const suppliersResult = await getAllSuppliersAction({
    page,
    pageSize,
    name,
    status,
    sortBy,
    sortOrder,
  });

  if (!suppliersResult.success) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-bold">Nhà cung cấp</h1>
        <div className="text-red-500">
          Error: {suppliersResult.error || "Failed to load suppliers"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Nhà cung cấp</h1>
      <SuppliersTable
        data={suppliersResult.data!.suppliers}
        total={suppliersResult.data!.total}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
