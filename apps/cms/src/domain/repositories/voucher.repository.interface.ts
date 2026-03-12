import { VoucherEntity, DiscountType } from "../entities/voucher.entity";

export interface CreateVoucherDTO {
  code: string;
  description?: string;
  discount: number;
  discountType: DiscountType;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startsAt: Date;
  expiresAt: Date;
  isActive?: boolean;
}

export interface UpdateVoucherDTO {
  code?: string;
  description?: string;
  discount?: number;
  discountType?: DiscountType;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startsAt?: Date;
  expiresAt?: Date;
  isActive?: boolean;
}

export interface FindVouchersParams {
  page?: number;
  pageSize?: number;
  code?: string;
  status?: "active" | "inactive" | "all";
  discountType?: DiscountType;
  sortBy?: "code" | "discount" | "startsAt" | "expiresAt" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface IVoucherRepository {
  findMany(params: FindVouchersParams): Promise<{
    vouchers: VoucherEntity[];
    total: number;
  }>;
  findById(id: number): Promise<VoucherEntity | null>;
  findByCode(code: string): Promise<VoucherEntity | null>;
  create(data: CreateVoucherDTO): Promise<VoucherEntity>;
  update(id: number, data: UpdateVoucherDTO): Promise<VoucherEntity>;
  delete(id: number): Promise<void>;
  toggleActive(id: number): Promise<VoucherEntity>;
  count(): Promise<number>;
}
