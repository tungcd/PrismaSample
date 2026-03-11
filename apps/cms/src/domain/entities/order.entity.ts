export interface OrderEntity {
  id: string;
  orderNumber: string;
  userId: string;
  studentId: string | null;
  status: string;
  paymentStatus: string;
  total: number;
  paymentMethod: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  student?: {
    id: string;
    name: string;
  } | null;
}
