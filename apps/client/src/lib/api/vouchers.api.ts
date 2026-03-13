import { api } from "./index";

export interface Voucher {
  id: number;
  code: string;
  description?: string;
  discount: number;
  discountType: "PERCENTAGE" | "FIXED";
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface ValidateVoucherRequest {
  code: string;
  orderAmount: number;
}

export interface ValidateVoucherResponse {
  valid: boolean;
  voucher?: Voucher;
  discountAmount?: number;
  finalAmount?: number;
  message?: string;
}

export const vouchersApi = {
  /**
   * Get available vouchers
   */
  getAvailable: () => api.get<Voucher[]>("/vouchers?available=true"),

  /**
   * Get voucher by code
   */
  getByCode: (code: string) => api.get<Voucher>(`/vouchers/code/${code}`),

  /**
   * Validate voucher
   */
  validate: (data: ValidateVoucherRequest) =>
    api.post<ValidateVoucherResponse>("/vouchers/validate", data),
};
