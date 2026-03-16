import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Role } from "@smart-canteen/prisma";
import { StudentsService } from "../../src/students/students.service";

describe("StudentsService", () => {
  let service: StudentsService;

  const prisma = {
    student: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StudentsService(prisma as any);
  });

  it("findAllForUser should list all for admin", async () => {
    prisma.student.findMany.mockResolvedValue([{ id: 1 }]);

    await service.findAllForUser({ id: 999, role: Role.ADMIN });

    expect(prisma.student.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  });

  it("findAllForUser should scope by parent for parent role", async () => {
    prisma.student.findMany.mockResolvedValue([{ id: 1 }]);

    await service.findAllForUser({ id: 5, role: Role.PARENT });

    expect(prisma.student.findMany).toHaveBeenCalledWith({
      where: { parentId: 5, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  });

  it("create should force parentId for parent role", async () => {
    prisma.student.create.mockResolvedValue({ id: 1, parentId: 5 });

    const result = await service.create({ id: 5, role: Role.PARENT }, {
      name: "A",
      grade: "1",
      school: "S",
      parentId: 123,
    } as any);

    expect(prisma.student.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ parentId: 5 }),
      }),
    );
    expect(result).toEqual({ id: 1, parentId: 5 });
  });

  it("create should require parentId for admin role", async () => {
    await expect(
      service.create({ id: 1, role: Role.ADMIN }, {
        name: "A",
        grade: "1",
        school: "S",
      } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("linkCard should throw if card already used", async () => {
    prisma.student.findFirst
      .mockResolvedValueOnce({ id: 1, parentId: 2 })
      .mockResolvedValueOnce({ id: 99 });

    await expect(
      service.linkCard({ id: 2, role: Role.PARENT }, 1, "CARD-1"),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("linkCard should update card when available", async () => {
    prisma.student.findFirst
      .mockResolvedValueOnce({ id: 1, parentId: 2 })
      .mockResolvedValueOnce(null);
    prisma.student.update.mockResolvedValue({ id: 1, cardNumber: "CARD-1" });

    await expect(
      service.linkCard({ id: 2, role: Role.PARENT }, 1, "CARD-1"),
    ).resolves.toEqual({ id: 1, cardNumber: "CARD-1" });
  });

  it("findOne should reject access for another parent", async () => {
    prisma.student.findFirst.mockResolvedValue({ id: 1, parentId: 99 });

    await expect(
      service.findOne({ id: 2, role: Role.PARENT }, 1),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("remove should soft delete student", async () => {
    prisma.student.findFirst.mockResolvedValue({ id: 1, parentId: 2 });
    prisma.student.update.mockResolvedValue({ id: 1, isActive: false });

    await expect(
      service.remove({ id: 2, role: Role.PARENT }, 1),
    ).resolves.toEqual({ id: 1, isActive: false });
  });

  it("unlinkCard should clear card number", async () => {
    prisma.student.findFirst.mockResolvedValue({ id: 1, parentId: 2 });
    prisma.student.update.mockResolvedValue({ id: 1, cardNumber: null });

    await expect(
      service.unlinkCard({ id: 2, role: Role.PARENT }, 1),
    ).resolves.toEqual({ id: 1, cardNumber: null });
  });

  it("getStudentOrders should return related orders", async () => {
    prisma.student.findFirst.mockResolvedValue({ id: 1, parentId: 2 });
    prisma.order.findMany.mockResolvedValue([{ id: 10 }]);

    await expect(
      service.getStudentOrders({ id: 2, role: Role.PARENT }, 1),
    ).resolves.toEqual([{ id: 10 }]);
  });

  it("getStudentSpendingSummary should aggregate totals", async () => {
    prisma.student.findFirst.mockResolvedValue({
      id: 1,
      parentId: 2,
      name: "Student",
      grade: "1",
      school: "School",
    });

    prisma.order.findMany.mockResolvedValue([
      {
        id: 1,
        total: 10,
        status: "PENDING",
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
      },
      {
        id: 2,
        total: 20,
        status: "COMPLETED",
        createdAt: new Date("2026-03-15T00:00:00.000Z"),
      },
    ]);

    const result = await service.getStudentSpendingSummary(
      { id: 2, role: Role.PARENT },
      1,
    );

    expect(result.totalSpent).toBe(30);
    expect(result.orderCount).toBe(2);
    expect(result.byMonth["2026-03"]).toBe(30);
  });
});
