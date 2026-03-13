import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  studentsApi,
  CreateStudentDto,
  UpdateStudentDto,
} from "../api/students.api";
import { toast } from "sonner";

/**
 * Get all students for current user
 */
export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => studentsApi.getAll(),
  });
}

/**
 * Get single student by ID
 */
export function useStudent(id: number, enabled = true) {
  return useQuery({
    queryKey: ["students", id],
    queryFn: () => studentsApi.getById(id),
    enabled: enabled && !!id,
  });
}

/**
 * Create new student
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentDto) => studentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Đã thêm học sinh");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể thêm học sinh");
    },
  });
}

/**
 * Update student
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStudentDto }) =>
      studentsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students", variables.id] });
      toast.success("Đã cập nhật thông tin học sinh");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể cập nhật học sinh");
    },
  });
}

/**
 * Delete student
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Đã xóa học sinh");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể xóa học sinh");
    },
  });
}

/**
 * Link card to student
 */
export function useLinkCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cardNumber }: { id: number; cardNumber: string }) =>
      studentsApi.linkCard(id, cardNumber),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students", variables.id] });
      toast.success("Đã liên kết thẻ");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể liên kết thẻ");
    },
  });
}

/**
 * Unlink card from student
 */
export function useUnlinkCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => studentsApi.unlinkCard(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students", id] });
      toast.success("Đã hủy liên kết thẻ");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể hủy liên kết thẻ");
    },
  });
}

/**
 * Get student's orders
 */
export function useStudentOrders(id: number) {
  return useQuery({
    queryKey: ["students", id, "orders"],
    queryFn: () => studentsApi.getOrders(id),
    enabled: !!id,
  });
}

/**
 * Get student's spending summary
 */
export function useStudentSpendingSummary(id: number) {
  return useQuery({
    queryKey: ["students", id, "spending-summary"],
    queryFn: () => studentsApi.getSpendingSummary(id),
    enabled: !!id,
  });
}
