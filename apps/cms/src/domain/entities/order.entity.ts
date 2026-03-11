export interface OrderEntity {
  id: number;
  orderNumber: string;
  userId: number;
  studentId: number | null;
  status: string;
  paymentStatus: string;
  total: number;
  paymentMethod: string;
  createdAt: Date;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  student?: {
    id: number;
    name: string;
  } | null;
}
