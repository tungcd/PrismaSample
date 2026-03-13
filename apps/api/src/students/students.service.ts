import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";

interface AuthUser {
  id: number;
  role: Role;
}

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAllForUser(user: AuthUser) {
    if (this.canManageAllStudents(user.role)) {
      return this.prisma.student.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      });
    }

    return this.prisma.student.findMany({
      where: {
        parentId: user.id,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(user: AuthUser, dto: CreateStudentDto) {
    const parentId = this.resolveParentId(user, dto.parentId);

    return this.prisma.student.create({
      data: {
        name: dto.name,
        grade: dto.grade,
        school: dto.school,
        cardNumber: dto.cardNumber,
        avatar: dto.avatar,
        parentId,
      },
    });
  }

  async findOne(user: AuthUser, id: number) {
    const student = await this.prisma.student.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!student) {
      throw new NotFoundException("Không tìm thấy học sinh");
    }

    this.ensureStudentAccess(user, student.parentId);
    return student;
  }

  async update(user: AuthUser, id: number, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!student) {
      throw new NotFoundException("Không tìm thấy học sinh");
    }

    this.ensureStudentAccess(user, student.parentId);

    return this.prisma.student.update({
      where: { id },
      data: dto,
    });
  }

  async remove(user: AuthUser, id: number) {
    const student = await this.findOne(user, id);

    return this.prisma.student.update({
      where: { id: student.id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async linkCard(user: AuthUser, id: number, cardNumber: string) {
    const student = await this.findOne(user, id);

    const existed = await this.prisma.student.findFirst({
      where: {
        cardNumber,
        deletedAt: null,
        id: { not: id },
      },
      select: { id: true },
    });

    if (existed) {
      throw new BadRequestException(
        "Mã thẻ đã được liên kết với học sinh khác",
      );
    }

    return this.prisma.student.update({
      where: { id: student.id },
      data: { cardNumber },
    });
  }

  async unlinkCard(user: AuthUser, id: number) {
    const student = await this.findOne(user, id);

    return this.prisma.student.update({
      where: { id: student.id },
      data: { cardNumber: null },
    });
  }

  async getStudentOrders(user: AuthUser, id: number) {
    const student = await this.findOne(user, id);

    return this.prisma.order.findMany({
      where: {
        studentId: student.id,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true },
            },
          },
        },
      },
    });
  }

  async getStudentSpendingSummary(user: AuthUser, id: number) {
    const student = await this.findOne(user, id);

    const orders = await this.prisma.order.findMany({
      where: {
        studentId: student.id,
        deletedAt: null,
      },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );
    const byMonth: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const order of orders) {
      const monthKey = order.createdAt.toISOString().slice(0, 7);
      byMonth[monthKey] = (byMonth[monthKey] ?? 0) + Number(order.total);
      byStatus[order.status] = (byStatus[order.status] ?? 0) + 1;
    }

    return {
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        school: student.school,
      },
      totalSpent,
      orderCount: orders.length,
      averageOrderValue: orders.length ? totalSpent / orders.length : 0,
      byMonth,
      byStatus,
    };
  }

  private canManageAllStudents(role: Role) {
    return role === Role.ADMIN || role === Role.MANAGER || role === Role.STAFF;
  }

  private resolveParentId(user: AuthUser, parentId?: number) {
    if (!this.canManageAllStudents(user.role)) {
      return user.id;
    }

    if (!parentId) {
      throw new ForbiddenException("parentId là bắt buộc cho vai trò quản trị");
    }

    return parentId;
  }

  private ensureStudentAccess(user: AuthUser, parentId: number) {
    if (this.canManageAllStudents(user.role)) {
      return;
    }

    if (user.id !== parentId) {
      throw new ForbiddenException("Bạn không có quyền truy cập học sinh này");
    }
  }
}
