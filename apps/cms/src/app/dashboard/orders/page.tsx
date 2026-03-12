import { getOrdersUseCase } from "@/application/use-cases/order/get-orders.use-case";
import { OrdersTable } from "./_components/orders-table";

interface OrdersPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    orderNumber?: string;
    status?: string;
    paymentStatus?: string;
    user?: string; // Filter by userId
    student?: string; // Filter by studentId
    sortBy?: string;
    sortOrder?: string;
  };
}

// Force dynamic rendering to prevent caching issues with pagination
// ISR: Cache for 30 seconds (orders need near real-time updates)
export const revalidate = 30;

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : 10,
    orderNumber: searchParams.orderNumber,
    status: searchParams.status,
    paymentStatus: searchParams.paymentStatus,
    userId: searchParams.user ? parseInt(searchParams.user) : undefined,
    studentId: searchParams.student
      ? parseInt(searchParams.student)
      : undefined,
    sortBy: searchParams.sortBy as any,
    sortOrder: searchParams.sortOrder as any,
  };

  const result = await getOrdersUseCase.execute(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đơn hàng</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý đơn hàng trong hệ thống
          </p>
        </div>
      </div>

      <OrdersTable data={result} />
    </div>
  );
}
