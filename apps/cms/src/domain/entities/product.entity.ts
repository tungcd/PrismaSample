export interface ProductEntity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
  category?: {
    id: string;
    name: string;
  };
}
