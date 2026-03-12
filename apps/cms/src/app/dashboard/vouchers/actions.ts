"use server";

import { withRole } from "@/lib/with-auth";
import { getAllVouchersUseCase } from "@/application/use-cases/voucher/get-all-vouchers.use-case";
import { createVoucherUseCase } from "@/application/use-cases/voucher/create-voucher.use-case";
import { updateVoucherUseCase } from "@/application/use-cases/voucher/update-voucher.use-case";
import { deleteVoucherUseCase } from "@/application/use-cases/voucher/delete-voucher.use-case";
import { toggleVoucherActiveUseCase } from "@/application/use-cases/voucher/toggle-voucher-active.use-case";
import { DiscountType } from "@/domain/entities/voucher.entity";
import {
  FindVouchersParams,
  CreateVoucherDTO,
  UpdateVoucherDTO,
} from "@/domain/repositories/voucher.repository.interface";

export const getAllVouchersAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, params: FindVouchersParams) => {
    try {
      const result = await getAllVouchersUseCase.execute(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
);

export const createVoucherAction = withRole(
  ["ADMIN"],
  async (authUser, data: CreateVoucherDTO) => {
    try {
      const voucher = await createVoucherUseCase.execute(data);
      return { success: true, data: voucher };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
);

export const updateVoucherAction = withRole(
  ["ADMIN"],
  async (authUser, id: number, data: UpdateVoucherDTO) => {
    try {
      const voucher = await updateVoucherUseCase.execute(id, data);
      return { success: true, data: voucher };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
);

export const deleteVoucherAction = withRole(
  ["ADMIN"],
  async (authUser, id: number) => {
    try {
      await deleteVoucherUseCase.execute(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
);

export const toggleVoucherActiveAction = withRole(
  ["ADMIN"],
  async (authUser, id: number) => {
    try {
      const voucher = await toggleVoucherActiveUseCase.execute(id);
      return { success: true, data: voucher };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
);
