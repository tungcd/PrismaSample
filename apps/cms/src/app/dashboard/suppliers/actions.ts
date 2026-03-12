"use server";

import { withRole } from "@/lib/with-auth";
import { getAllSuppliersUseCase } from "@/application/use-cases/supplier/get-all-suppliers.use-case";
import { createSupplierUseCase } from "@/application/use-cases/supplier/create-supplier.use-case";
import { updateSupplierUseCase } from "@/application/use-cases/supplier/update-supplier.use-case";
import { deleteSupplierUseCase } from "@/application/use-cases/supplier/delete-supplier.use-case";
import { toggleSupplierActiveUseCase } from "@/application/use-cases/supplier/toggle-supplier-active.use-case";
import {
  FindSuppliersParams,
  CreateSupplierDTO,
  UpdateSupplierDTO,
} from "@/domain/repositories/supplier.repository.interface";

export const getAllSuppliersAction = withRole(
  ["ADMIN"],
  async (authUser, params: FindSuppliersParams = {}) => {
    try {
      const result = await getAllSuppliersUseCase.execute(params);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get suppliers",
      };
    }
  },
);

export const createSupplierAction = withRole(
  ["ADMIN"],
  async (authUser, data: CreateSupplierDTO) => {
    try {
      const supplier = await createSupplierUseCase.execute(data);
      return { success: true, data: supplier };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create supplier",
      };
    }
  },
);

export const updateSupplierAction = withRole(
  ["ADMIN"],
  async (authUser, id: number, data: UpdateSupplierDTO) => {
    try {
      const supplier = await updateSupplierUseCase.execute(id, data);
      return { success: true, data: supplier };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update supplier",
      };
    }
  },
);

export const deleteSupplierAction = withRole(
  ["ADMIN"],
  async (authUser, id: number) => {
    try {
      await deleteSupplierUseCase.execute(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete supplier",
      };
    }
  },
);

export const toggleSupplierActiveAction = withRole(
  ["ADMIN"],
  async (authUser, id: number) => {
    try {
      const supplier = await toggleSupplierActiveUseCase.execute(id);
      return { success: true, data: supplier };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle supplier status",
      };
    }
  },
);
