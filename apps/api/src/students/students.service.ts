import {
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
