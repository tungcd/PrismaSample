import {
  IInventoryTransactionRepository,
  FindInventoryTransactionsParams,
  CreateInventoryTransactionDTO,
} from "@/domain/repositories/inventory-transaction.repository.interface";
import {
  InventoryTransactionEntity,
  InventoryStatsEntity,
  InventoryType,
} from "@/domain/entities/inventory-transaction.entity";
import { PrismaClient } from "@smart-canteen/prisma";

const prisma = new PrismaClient();

export class PrismaInventoryTransactionRepository implements IInventoryTransactionRepository {
  async findMany(
    params: FindInventoryTransactionsParams,
  ): Promise<InventoryTransactionEntity[]> {
    const {
      page = 1,
      pageSize = 10,
      productId,
      type,
      performedBy,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.type = type;
    }

    if (performedBy) {
      where.performedBy = performedBy;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    try {
      const transactions = await prisma.inventoryTransaction.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      return transactions.map((transaction: any) => ({
        id: transaction.id,
        productId: transaction.productId,
        quantity: transaction.quantity,
        type: transaction.type as InventoryType,
        reason: transaction.reason,
        performedBy: transaction.performedBy,
        createdAt: transaction.createdAt,
        product: transaction.product,
        user: transaction.user,
      }));
    } catch (error) {
      console.error("Error in findMany:", error);
      return [];
    }
  }

  async findById(id: number): Promise<InventoryTransactionEntity | null> {
    try {
      const transaction = await prisma.inventoryTransaction.findUnique({
        where: { id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!transaction) {
        return null;
      }

      return {
        id: transaction.id,
        productId: transaction.productId,
        quantity: transaction.quantity,
        type: transaction.type as InventoryType,
        reason: transaction.reason,
        performedBy: transaction.performedBy,
        createdAt: transaction.createdAt,
        product: transaction.product,
        user: transaction.user,
      };
    } catch (error) {
      console.error("Error in findById:", error);
      return null;
    }
  }

  async create(
    data: CreateInventoryTransactionDTO,
  ): Promise<InventoryTransactionEntity> {
    // Validate product exists and get current stock
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, stock: true, name: true, slug: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Calculate new stock
    const newStock = product.stock + data.quantity;

    if (newStock < 0) {
      throw new Error("Insufficient stock for this operation");
    }

    // Create transaction and update product stock using sequential operations
    try {
      // First, create the inventory transaction
      const createdTransaction = await prisma.inventoryTransaction.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          type: data.type,
          reason: data.reason,
          performedBy: data.performedBy,
        },
      });

      // Then, update product stock
      await prisma.product.update({
        where: { id: data.productId },
        data: { stock: newStock },
      });

      // Finally, fetch the transaction with relations
      const transaction = await prisma.inventoryTransaction.findUnique({
        where: { id: createdTransaction.id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!transaction) {
        throw new Error("Failed to fetch created transaction");
      }

      return {
        id: transaction.id,
        productId: transaction.productId,
        quantity: transaction.quantity,
        type: transaction.type as InventoryType,
        reason: transaction.reason,
        performedBy: transaction.performedBy,
        createdAt: transaction.createdAt,
        product: transaction.product,
        user: transaction.user,
      };
    } catch (error) {
      console.error("Error creating inventory transaction:", error);
      throw new Error("Failed to create inventory transaction");
    }
  }

  async getStats(): Promise<InventoryStatsEntity> {
    // Get total active products
    const totalProducts = await prisma.product.count({
      where: {
        deletedAt: null,
        isActive: true,
      },
    });

    // Get all products to check stock levels
    const allProducts = await prisma.product.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
        price: true,
      },
    });

    // Filter low stock products (stock > 0 && stock <= 10 as default threshold)
    const lowStockProducts = allProducts.filter(
      (p) => p.stock > 0 && p.stock <= 10,
    );

    // Count out of stock
    const outOfStockCount = allProducts.filter((p) => p.stock === 0).length;

    // Calculate total stock value
    const totalStockValue = allProducts.reduce((sum, product) => {
      return sum + product.stock * Number(product.price);
    }, 0);

    return {
      totalProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount,
      totalStockValue,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        stock: p.stock,
        lowStockThreshold: 10, // Default threshold
        price: Number(p.price),
      })),
    };
  }

  async count(
    params: Omit<
      FindInventoryTransactionsParams,
      "page" | "pageSize" | "sortBy" | "sortOrder"
    >,
  ): Promise<number> {
    const { productId, type, performedBy, startDate, endDate } = params;

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.type = type;
    }

    if (performedBy) {
      where.performedBy = performedBy;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    try {
      return await prisma.inventoryTransaction.count({ where });
    } catch (error) {
      console.error("Error in count:", error);
      return 0;
    }
  }
}

export const inventoryTransactionRepository =
  new PrismaInventoryTransactionRepository();
