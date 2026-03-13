import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  topUpRequestsApi,
  CreateTopUpRequestDto,
} from "../api/top-up-requests.api";
import { toast } from "sonner";

export function useCreateTopUpRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTopUpRequestDto) => topUpRequestsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["topUpRequests"] });
      toast.success("Yêu cầu nạp tiền đã được gửi. Vui lòng chờ xác nhận.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể tạo yêu cầu nạp tiền");
    },
  });
}

export function useTopUpRequests() {
  return useQuery({
    queryKey: ["topUpRequests"],
    queryFn: () => topUpRequestsApi.getAll(),
  });
}

export function useTopUpRequest(id: number) {
  return useQuery({
    queryKey: ["topUpRequest", id],
    queryFn: () => topUpRequestsApi.getOne(id),
    enabled: !!id,
  });
}

export function useCancelTopUpRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => topUpRequestsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topUpRequests"] });
      toast.success("Đã hủy yêu cầu nạp tiền");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể hủy yêu cầu");
    },
  });
}
