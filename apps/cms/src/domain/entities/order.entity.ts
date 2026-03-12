export interface OrderItemEntity {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    images: string[];
  };
}

export interface OrderEntity {
  id: number;
  orderNumber: string;
  userId: number;
  studentId: number | null;
  status: string;
  paymentStatus: string;
  total: number;
  paymentMethod: string;
  notes: string | null;
  
  // Fulfillment timestamps
  preparedAt: Date | null;
  readyAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: {
    id: number;
    name: string;
    email: string;
  };
  student?: {
    id: number;
    name: string;
    grade: string;
  } | null;
  items?: OrderItemEntity[];
}
