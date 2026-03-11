export interface StudentEntity {
  id: number;
  name: string;
  grade: string;
  school: string;
  cardNumber: string | null;
  isActive: boolean;
  parentId: number;
  createdAt: Date;
  parent?: {
    id: number;
    name: string;
    email: string;
  };
}
