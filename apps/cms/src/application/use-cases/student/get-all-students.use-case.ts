import { StudentEntity } from "@/domain/entities/student.entity";
import { studentRepository } from "@/infrastructure/database/repositories/student.repository";

export interface GetStudentsParams {
  page?: number;
  pageSize?: number;
  name?: string;
  grade?: string;
  school?: string;
  cardNumber?: string;
  status?: string;
  sortBy?: "name" | "grade" | "school" | "cardNumber";
  sortOrder?: "asc" | "desc";
}

export interface GetStudentsResult {
  students: StudentEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class GetAllStudentsUseCase {
  async execute(params: GetStudentsParams = {}): Promise<GetStudentsResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const { students, total } = await studentRepository.findMany(params);

    return {
      students,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

export const getAllStudentsUseCase = new GetAllStudentsUseCase();
