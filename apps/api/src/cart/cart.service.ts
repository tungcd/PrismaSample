import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface CartItemData {
  productId: number;
  quantity: number;
  studentId?: number;
}

@Injectable()
export class CartService {
  private carts = new Map<number, CartItemData[]>();

  constructor(private prisma: PrismaService) {}

  private getCartItems(userId: number): CartItemData[] {
    return this.carts.get(userId) ?? [];
  }

  async getCartWithDetails(userId: number) {
    const items = this.getCartItems(userId);
    if (!items.length) {
      return { items: [], total: 0, itemCount: 0 };
    }

    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        stock: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    let total = 0;

    const enriched = items.map((item) => {
      const product = productMap.get(item.productId);
      const subtotal = product ? Number(product.price) * item.quantity : 0;
      total += subtotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        studentId: item.studentId,
        product: product ?? null,
        subtotal: Math.round(subtotal * 100) / 100,
      };
    });

    return {
      items: enriched,
      total: Math.round(total * 100) / 100,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    };
  }

  addItem(
    userId: number,
    productId: number,
    quantity: number,
    studentId?: number,
  ) {
    const cart = [...this.getCartItems(userId)];
    const existing = cart.find(
      (i) => i.productId === productId && i.studentId === studentId,
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity, studentId });
    }

    this.carts.set(userId, cart);
  }

  updateItem(userId: number, productId: number, quantity: number) {
    const cart = this.getCartItems(userId).map((i) =>
      i.productId === productId ? { ...i, quantity } : i,
    );
    this.carts.set(
      userId,
      cart.filter((i) => i.quantity > 0),
    );
  }

  removeItem(userId: number, productId: number) {
    const cart = this.getCartItems(userId).filter(
      (i) => i.productId !== productId,
    );
    this.carts.set(userId, cart);
  }

  clearCart(userId: number) {
    this.carts.delete(userId);
  }

  getRawItems(userId: number): CartItemData[] {
    return this.getCartItems(userId);
  }

  async validateCart(userId: number) {
    const { items } = await this.getCartWithDetails(userId);
    const issues: string[] = [];

    for (const item of items) {
      if (!item.product) {
        issues.push(`Sản phẩm #${item.productId} không còn hoạt động`);
      } else if (item.product.stock < item.quantity) {
        issues.push(
          `${item.product.name}: chỉ còn ${item.product.stock} sản phẩm trong kho`,
        );
      }
    }

    return { valid: issues.length === 0, issues };
  }
}
