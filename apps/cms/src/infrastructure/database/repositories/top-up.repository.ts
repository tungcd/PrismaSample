import { TopUpRequest, Prisma } from "@smart-canteen/prisma";
import { prisma } from "@/lib/prisma";
import { TopUpEntity } from "@/domain/entities/top-up.entity";
import {
  ITopUpRepository,
  FindTopUpsParams,
  CreateTopUpDTO,
  ApproveTopUpDTO,
  RejectTopUpDTO,
} from "@/domain/repositories/top-up.repository.interface";

export class PrismaTopUpRepository implements ITopUpRepository {
  private mapTopUpToEntity(
    topUp: TopUpRequest & {
      user?: { id: number; name: string; email: string; phone: string | null };
      approver?: { id: number; name: string; email: string } | null;
    },
  ): TopUpEntity {
    return {
      id: topUp.id,
      userId: topUp.userId,
      amount: Number(topUp.amount),
      status: topUp.status as "PENDING" | "APPROVED" | "REJECTED",
      proofImage: topUp.proofImage || undefined,
      notes: topUp.notes || undefined,
      adminNotes: topUp.adminNotes || undefined,
      approvedBy: topUp.approvedBy || undefined,
      processedAt: topUp.processedAt || undefined,
      createdAt: topUp.createdAt,
      updatedAt: topUp.updatedAt,
      user: topUp.user
        ? {
            id: topUp.user.id,
            name: topUp.user.name,
            email: topUp.user.email,
            phone: topUp.user.phone || undefined,
          }
        : undefined,
      approver: topUp.approver
        ? {
            id: topUp.approver.id,
            name: topUp.approver.name,
            email: topUp.approver.email,
          }
        : undefined,
    };
  }

  async findMany(params: FindTopUpsParams): Promise<{ topUps: TopUpEntity[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      status,
      userId,
      approvedBy,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: Prisma.TopUpRequestWhereInput = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (approvedBy) {
      where.approvedBy = approvedBy;
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

    const [topUps, total] = await Promise.all([
      prisma.topUpRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          approver: {
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
      }),
      prisma.topUpRequest.count({ where }),
    ]);

    return {
      topUps: topUps.map((topUp) => this.mapTopUpToEntity(topUp)),
      total,
    };
  }

  async findAll(): Promise<TopUpEntity[]> {
    const topUps = await prisma.topUpRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return topUps.map((topUp) => this.mapTopUpToEntity(topUp));
  }

  async findById(id: number): Promise<TopUpEntity | null> {
    const topUp = await prisma.topUpRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return topUp ? this.mapTopUpToEntity(topUp) : null;
  }

  async findByUserId(userId: number): Promise<TopUpEntity[]> {
    const topUps = await prisma.topUpRequest.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return topUps.map((topUp) => this.mapTopUpToEntity(topUp));
  }

  async count(): Promise<number> {
    return prisma.topUpRequest.count();
  }

  async countByStatus(status: "PENDING" | "APPROVED" | "REJECTED"): Promise<number> {
    return prisma.topUpRequest.count({
      where: { status },
    });
  }

  async getTotalApprovedAmount(userId?: number): Promise<number> {
    const result = await prisma.topUpRequest.aggregate({
      where: {
        status: "APPROVED",
        ...(userId && { userId }),
      },
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount || 0);
  }

  async create(data: CreateTopUpDTO): Promise<TopUpEntity> {
    const topUp = await prisma.topUpRequest.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        proofImage: data.proofImage,
        notes: data.notes,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.mapTopUpToEntity(topUp);
  }

  async approve(id: number, data: ApproveTopUpDTO): Promise<TopUpEntity> {
    // Validate that approver user exists
    const approver = await prisma.user.findUnique({
      where: { id: data.approvedBy },
    });

    if (!approver) {
      throw new Error(`User with ID ${data.approvedBy} not found. Cannot approve top-up request.`);
    }

    // Use transaction to update top-up request and wallet balance
    const result = await prisma.$transaction(async (tx) => {
      // Get the top-up request
      const topUpRequest = await tx.topUpRequest.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!topUpRequest) {
        throw new Error("Top-up request not found");
      }

      if (topUpRequest.status !== "PENDING") {
        throw new Error("Only pending top-up requests can be approved");
      }

      // Update top-up request status
      const updatedTopUp = await tx.topUpRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedBy: data.approvedBy,
          adminNotes: data.adminNotes,
          processedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Get user's wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: topUpRequest.userId },
      });

      if (!wallet) {
        throw new Error("User wallet not found");
      }

      const balanceBefore = Number(wallet.balance);
      const amount = Number(topUpRequest.amount);
      const balanceAfter = balanceBefore + amount;

      // Update wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "TOP_UP",
          amount,
          balanceBefore,
          balanceAfter,
          description: `Top-up approved by admin`,
          metadata: {
            topUpRequestId: id,
            approvedBy: data.approvedBy,
          },
        },
      });

      return updatedTopUp;
    });

    return this.mapTopUpToEntity(result);
  }

  async reject(id: number, data: RejectTopUpDTO): Promise<TopUpEntity> {
    // Validate that approver user exists
    const approver = await prisma.user.findUnique({
      where: { id: data.approvedBy },
    });

    if (!approver) {
      throw new Error(`User with ID ${data.approvedBy} not found. Cannot reject top-up request.`);
    }

    // Check if the top-up request exists and is pending
    const existingTopUp = await prisma.topUpRequest.findUnique({
      where: { id },
    });

    if (!existingTopUp) {
      throw new Error("Top-up request not found");
    }

    if (existingTopUp.status !== "PENDING") {
      throw new Error("Only pending top-up requests can be rejected");
    }

    const topUp = await prisma.topUpRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        approvedBy: data.approvedBy,
        adminNotes: data.adminNotes,
        processedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.mapTopUpToEntity(topUp);
  }

  async delete(id: number): Promise<void> {
    await prisma.topUpRequest.delete({
      where: { id },
    });
  }
}
