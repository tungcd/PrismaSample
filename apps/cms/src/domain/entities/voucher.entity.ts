export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

export interface VoucherEntity {
  id: number;
  code: string;
  description: string | null;
  discount: number;
  discountType: DiscountType;
  minAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startsAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
