import { StudentEntity } from "../entities/student.entity";

export interface CreateStudentDTO {
  name: string;
  grade: string;
  school: string;
  cardNumber: string;
  parentId: string;
}

export interface UpdateStudentDTO {
  name?: string;
  grade?: string;
  school?: string;
  cardNumber?: string;
  parentId?: string;
}

export interface IStudentRepository {
  findAll(): Promise<StudentEntity[]>;
  findById(id: string): Promise<StudentEntity | null>;
  count(): Promise<number>;
  create(data: CreateStudentDTO): Promise<StudentEntity>;
  update(id: string, data: UpdateStudentDTO): Promise<StudentEntity>;
  delete(id: string): Promise<void>;
  toggleActive(id: string): Promise<StudentEntity>;
}
