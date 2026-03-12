"use server";

import { getOrdersUseCase } from "@/application/use-cases/order/get-orders.use-case";
import { createOrderUseCase } from "@/application/use-cases/order/create-order.use-case";
import { updateOrderStatusUseCase } from "@/application/use-cases/order/update-order-status.use-case";
import { deleteOrderUseCase } from "@/application/use-cases/order/delete-order.use-case";
import { parseDbError } from "@/lib/utils/error-handler";
import { withRole } from "@/lib/with-auth";
import type { CreateOrderDTO } from "@/domain/repositories/order.repository.interface";

/**
 * Create new order - ADMIN, MANAGER, and STAFF can create orders
 * Authentication & Authorization: Verified via JWT token from cookies
 */
export const createOrderAction = withRole(
  ["ADMIN", "MANAGER", "STAFF"],
  async (authUser, data: CreateOrderDTO) => {
    try {
      const order = await createOrderUseCase.execute(data);
      return { success: true, data: order };
    } catch (error: any) {
      return { success: false, error: parseDbError(error) };
    }
  },
);

/**
 * Update order status - ADMIN, MANAGER, and STAFF can update
 * Authentication & Authorization: Verified via JWT token from cookies
 */
export const updateOrderStatusAction = withRole(
  ["ADMIN", "MANAGER", "STAFF"],
  async (authUser, id: number, status: string) => {
    try {
      const order = await updateOrderStatusUseCase.execute(id, status);
      return { success: true, data: order };
    } catch (error: any) {
      return { success: false, error: parseDbError(error) };
    }
  },
);

/**
 * Delete order - Only ADMIN and MANAGER can delete orders
 * Authentication & Authorization: Verified via JWT token from cookies
 */
export const deleteOrderAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, id: number) => {
    try {
      await deleteOrderUseCase.execute(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: parseDbError(error) };
    }
  },
);
