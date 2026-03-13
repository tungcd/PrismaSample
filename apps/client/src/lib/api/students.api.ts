import { api } from "./index";

export interface Student {
  id: number;
  name: string;
  grade: string;
  school: string;
  cardNumber?: string;
  avatar?: string;
  isActive: boolean;
  parentId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDto {
  name: string;
  grade: string;
  school: string;
  cardNumber?: string;
  avatar?: string;
  parentId?: number; // Optional for admins creating for other parents
}

export interface UpdateStudentDto {
  name?: string;
  grade?: string;
  school?: string;
  cardNumber?: string;
  avatar?: string;
}

export const studentsApi = {
  /**
   * Get all students for current user
   * - Parents: returns their own students
   * - Admin/Staff: returns all students
   */
  getAll: () => api.get<Student[]>("/students"),

  /**
   * Get single student by ID
   */
  getById: (id: number) => api.get<Student>(`/students/${id}`),

  /**
   * Create new student
   */
  create: (data: CreateStudentDto) => api.post<Student>("/students", data),

  /**
   * Update student
   */
  update: (id: number, data: UpdateStudentDto) =>
    api.patch<Student>(`/students/${id}`, data),

  /**
   * Delete student (soft delete)
   */
  delete: (id: number) => api.delete<void>(`/students/${id}`),

  /**
   * Link card to student
   */
  linkCard: (id: number, cardNumber: string) =>
    api.post(`/students/${id}/link-card`, { cardNumber }),

  /**
   * Unlink card from student
   */
  unlinkCard: (id: number) => api.delete(`/students/${id}/link-card`),

  /**
   * Get student's orders
   */
  getOrders: (id: number) => api.get(`/students/${id}/orders`),

  /**
   * Get student's spending summary
   */
  getSpendingSummary: (id: number) =>
    api.get(`/students/${id}/spending-summary`),
};
