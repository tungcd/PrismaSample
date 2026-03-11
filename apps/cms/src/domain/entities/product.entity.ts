export interface ProductEntity {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  categoryId: number;
  isActive: boolean;
  createdAt: Date;
  category?: {
    id: number;
    name: string;
  };
}
