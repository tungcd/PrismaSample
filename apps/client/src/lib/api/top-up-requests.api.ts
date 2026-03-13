import { api } from "./index";

export interface TopUpRequest {
  id: number;
  userId: number;
  amount: number;
  proofImage?: string;
  notes?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopUpRequestDto {
  amount: number;
  proofImage?: string;
  notes?: string;
}

export const topUpRequestsApi = {
  /**
   * Create a new top-up request
   */
  create: (dto: CreateTopUpRequestDto) => {
    return api.post<TopUpRequest>("/top-up-requests", dto);
  },

  /**
   * Get all top-up requests
   */
  getAll: () => {
    return api.get<TopUpRequest[]>("/top-up-requests");
  },

  /**
   * Get a specific top-up request
   */
  getOne: (id: number) => {
    return api.get<TopUpRequest>(`/top-up-requests/${id}`);
  },

  /**
   * Cancel a pending top-up request
   */
  cancel: (id: number) => {
    return api.patch<TopUpRequest>(`/top-up-requests/${id}/cancel`);
  },
};
