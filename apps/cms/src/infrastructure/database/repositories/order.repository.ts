import { IOrderRepository } from "@/domain/repositories/order.repository.interface";
import { prisma } from "../prisma-client";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { OrderEntity } from "@/domain/entities/order.entity";

export class PrismaOrderRepository implements IOrderRepository {
  async findAll(): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      studentId: order.studentId,
      status: order.status as string,
      paymentStatus: order.paymentStatus as string,
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      user: order.user,
      student: order.student,
    }));
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const order = await prisma.order.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!order) return null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      studentId: order.studentId,
      status: order.status as string,
      paymentStatus: order.paymentStatus as string,
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      user: order.user,
      student: order.student,
    };
  }

  async findRecent(limit: number): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      studentId: order.studentId,
      status: order.status as string,
      paymentStatus: order.paymentStatus as string,
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      user: order.user,
      student: order.student,
    }));
  }

  async count(): Promise<number> {
    return prisma.order.count({
      where: { deletedAt: null },
    });
  }

  async countByStatus(status: string): Promise<number> {
    return prisma.order.count({
      where: {
        deletedAt: null,
        status: status as OrderStatus,
      },
    });
  }

  async calculateTotalRevenue(): Promise<number> {
    const result = await prisma.order.aggregate({
      where: {
        deletedAt: null,
        paymentStatus: PaymentStatus.PAID,
      },
      _sum: {
        total: true,
      },
    });

    return Number(result._sum.total ?? 0);
  }
}

export const orderRepository = new PrismaOrderRepository();
