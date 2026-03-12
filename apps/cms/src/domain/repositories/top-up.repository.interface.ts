import { TopUpEntity } from "../entities/top-up.entity";

export interface FindTopUpsParams {
  page?: number;
  pageSize?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "all";
  userId?: number;
  approvedBy?: number;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "createdAt" | "amount" | "processedAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateTopUpDTO {
  userId: number;
  amount: number;
  proofImage?: string;
  notes?: string;
}

export interface ApproveTopUpDTO {
  approvedBy: number;
  adminNotes?: string;
}

export interface RejectTopUpDTO {
  approvedBy: number;
  adminNotes: string;
}

export interface ITopUpRepository {
  findMany(params: FindTopUpsParams): Promise<{ topUps: TopUpEntity[]; total: number }>;
  findAll(): Promise<TopUpEntity[]>;
  findById(id: number): Promise<TopUpEntity | null>;
  findByUserId(userId: number): Promise<TopUpEntity[]>;
  count(): Promise<number>;
  countByStatus(status: "PENDING" | "APPROVED" | "REJECTED"): Promise<number>;
  getTotalApprovedAmount(userId?: number): Promise<number>;
  create(data: CreateTopUpDTO): Promise<TopUpEntity>;
  approve(id: number, data: ApproveTopUpDTO): Promise<TopUpEntity>;
  reject(id: number, data: RejectTopUpDTO): Promise<TopUpEntity>;
  delete(id: number): Promise<void>;
}
