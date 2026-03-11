export interface StudentEntity {
  id: string;
  name: string;
  grade: string;
  school: string;
  cardNumber: string | null;
  isActive: boolean;
  parentId: string;
  createdAt: Date;
  parent?: {
    id: string;
    name: string;
    email: string;
  };
}
