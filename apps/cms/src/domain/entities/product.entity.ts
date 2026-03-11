export interface ProductEntity {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  categoryId: number;
  supplierId: number | null;
  isActive: boolean;
  isFeatured: boolean;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // Relations
  category?: {
    id: number;
    name: string;
  };
  supplier?: {
    id: number;
    name: string;
  } | null;
}
