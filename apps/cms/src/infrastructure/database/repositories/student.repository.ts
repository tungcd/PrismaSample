import {
  IStudentRepository,
  CreateStudentDTO,
  UpdateStudentDTO,
} from "@/domain/repositories/student.repository.interface";
import { prisma } from "../prisma-client";
import { StudentEntity } from "@/domain/entities/student.entity";
import type { GetStudentsParams } from "@/application/use-cases/student/get-all-students.use-case";

export class PrismaStudentRepository implements IStudentRepository {
  async findMany(
    params: GetStudentsParams = {},
  ): Promise<{ students: StudentEntity[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      name,
      grade,
      school,
      cardNumber,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: any = { deletedAt: null };

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }
    if (grade && grade !== "all") {
      where.grade = grade;
    }
    if (school && school !== "all") {
      where.school = school;
    }
    if (cardNumber) {
      where.cardNumber = { contains: cardNumber, mode: "insensitive" };
    }
    if (status && status !== "all") {
      where.isActive = status === "active";
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.student.count({ where }),
    ]);

    return { students, total };
  }

  async findAll(): Promise<StudentEntity[]> {
    const students = await prisma.student.findMany({
      where: { deletedAt: null },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return students;
  }

  async findById(id: number): Promise<StudentEntity | null> {
    const student = await prisma.student.findUnique({
      where: { id, deletedAt: null },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return student;
  }

  async count(): Promise<number> {
    return prisma.student.count({
      where: { deletedAt: null },
    });
  }

  async create(data: CreateStudentDTO): Promise<StudentEntity> {
    const student = await prisma.student.create({
      data: {
        name: data.name,
        grade: data.grade,
        school: data.school,
        cardNumber: data.cardNumber,
        parentId: data.parentId,
        isActive: true,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return student;
  }

  async update(id: number, data: UpdateStudentDTO): Promise<StudentEntity> {
    const student = await prisma.student.update({
      where: { id },
      data: {
        name: data.name,
        grade: data.grade,
        school: data.school,
        cardNumber: data.cardNumber,
        parentId: data.parentId,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return student;
  }

  async delete(id: number): Promise<void> {
    await prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async toggleActive(id: number): Promise<StudentEntity> {
    const student = await prisma.student.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!student) throw new Error("Student not found");

    const updated = await prisma.student.update({
      where: { id },
      data: { isActive: !student.isActive },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }
}

export const studentRepository = new PrismaStudentRepository();
