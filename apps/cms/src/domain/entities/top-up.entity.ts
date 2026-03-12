export interface TopUpEntity {
  id: number;
  userId: number;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  proofImage?: string;
  notes?: string;
  adminNotes?: string;
  approvedBy?: number;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  approver?: {
    id: number;
    name: string;
    email: string;
  };
}
