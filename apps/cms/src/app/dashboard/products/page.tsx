import { getAllProductsAction } from "./actions";
import { getCategoriesAction } from "./categories-actions";
import { ProductsTable } from "./_components/products-table";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    name?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    stock?: string;
    status?: string;
    isFeatured?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "10");
  const sortBy = searchParams.sortBy as
    | "name"
    | "price"
    | "stock"
    | "createdAt"
    | undefined;

  // Fetch products
  const productsResult = await getAllProductsAction({
    page,
    pageSize,
    name: searchParams.name,
    categoryId: searchParams.categoryId,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    stock: searchParams.stock,
    status: searchParams.status,
    isFeatured: searchParams.isFeatured,
    sortBy: sortBy || "createdAt",
    sortOrder: (searchParams.sortOrder as "asc" | "desc") || "desc",
  });

  if (!productsResult.success || !productsResult.data) {
    return <div>Error: {productsResult.error || "Unknown error"}</div>;
  }

  // Fetch categories for filter
  const categoriesResult = await getCategoriesAction();
  const categoryOptions =
    categoriesResult.success && categoriesResult.data
      ? categoriesResult.data.map((cat) => ({
          value: cat.id.toString(),
          label: cat.name,
        }))
      : [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <p className="text-gray-600 mt-1">Quản lý kho hàng và giá sản phẩm</p>
      </div>

      <ProductsTable
        data={productsResult.data.products}
        total={productsResult.data.total}
        page={page}
        pageSize={pageSize}
        categoryOptions={categoryOptions}
      />
    </div>
  );
}
