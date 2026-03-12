import { getAllCategoriesAction } from "./actions";
import { CategoriesTable } from "./_components/categories-table";

// ISR: Cache for 300 seconds (categories rarely change)
export const revalidate = 300;

interface CategoriesPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    name?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "10");
  const name = searchParams.name;
  const status = searchParams.status;
  const sortBy = searchParams.sortBy as "name" | "sortOrder" | "createdAt";
  const sortOrder = searchParams.sortOrder as "asc" | "desc";

  const categoriesResult = await getAllCategoriesAction({
    page,
    pageSize,
    name,
    status,
    sortBy,
    sortOrder,
  });

  if (!categoriesResult.success) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-bold">Danh mục sản phẩm</h1>
        <div className="text-red-500">
          Error: {categoriesResult.error || "Failed to load categories"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Danh mục sản phẩm</h1>
      <CategoriesTable
        data={categoriesResult.data!.categories}
        total={categoriesResult.data!.total}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
