import { StudentEntity } from "../entities/student.entity";

export interface CreateStudentDTO {
  name: string;
  grade: string;
  school: string;
  cardNumber: string;
  avatar?: string;
  parentId: number;
}

export interface UpdateStudentDTO {
  name?: string;
  grade?: string;
  school?: string;
  cardNumber?: string;
  avatar?: string;
  parentId?: number;
}

export interface IStudentRepository {
  findAll(): Promise<StudentEntity[]>;
  findById(id: number): Promise<StudentEntity | null>;
  count(): Promise<number>;
  create(data: CreateStudentDTO): Promise<StudentEntity>;
  update(id: number, data: UpdateStudentDTO): Promise<StudentEntity>;
  delete(id: number): Promise<void>;
  toggleActive(id: number): Promise<StudentEntity>;
}
