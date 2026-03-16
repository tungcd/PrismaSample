import { Role } from "@smart-canteen/prisma";
import { StudentsController } from "../../src/students/students.controller";
import { StudentsService } from "../../src/students/students.service";

describe("StudentsController", () => {
  let controller: StudentsController;
  let service: jest.Mocked<StudentsService>;

  beforeEach(() => {
    service = {
      findAllForUser: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      linkCard: jest.fn(),
      unlinkCard: jest.fn(),
      getStudentOrders: jest.fn(),
      getStudentSpendingSummary: jest.fn(),
    } as unknown as jest.Mocked<StudentsService>;

    controller = new StudentsController(service);
  });

  it("getStudents should call service", async () => {
    const user = { id: 1, role: Role.PARENT };
    service.findAllForUser.mockResolvedValue([{ id: 1 }] as any);

    await expect(controller.getStudents(user)).resolves.toEqual([{ id: 1 }]);
    expect(service.findAllForUser).toHaveBeenCalledWith(user);
  });

  it("linkCard should call service with cardNumber", async () => {
    const user = { id: 1, role: Role.PARENT };
    service.linkCard.mockResolvedValue({ id: 1, cardNumber: "CARD-1" } as any);

    await expect(
      controller.linkCard(user, 1, { cardNumber: "CARD-1" }),
    ).resolves.toEqual({ id: 1, cardNumber: "CARD-1" });

    expect(service.linkCard).toHaveBeenCalledWith(user, 1, "CARD-1");
  });

  it("getStudentSpendingSummary should call service", async () => {
    const user = { id: 1, role: Role.PARENT };
    service.getStudentSpendingSummary.mockResolvedValue({
      totalSpent: 100,
    } as any);

    await expect(
      controller.getStudentSpendingSummary(user, 10),
    ).resolves.toEqual({
      totalSpent: 100,
    });
    expect(service.getStudentSpendingSummary).toHaveBeenCalledWith(user, 10);
  });

  it("createStudent should call service", async () => {
    const user = { id: 1, role: Role.PARENT };
    service.create.mockResolvedValue({ id: 11 } as any);

    await expect(
      controller.createStudent(user, {
        name: "A",
        grade: "1",
        school: "S",
      } as any),
    ).resolves.toEqual({ id: 11 });
    expect(service.create).toHaveBeenCalledWith(user, {
      name: "A",
      grade: "1",
      school: "S",
    });
  });

  it("getStudent should call service", async () => {
    const user = { id: 1, role: Role.PARENT };
    service.findOne.mockResolvedValue({ id: 5 } as any);

    await expect(controller.getStudent(user, 5)).resolves.toEqual({ id: 5 });
    expect(service.findOne).toHaveBeenCalledWith(user, 5);
  });

  it("updateStudent should call service", async () => {
    const user = { id: 1, role: Role.PARENT };
    service.update.mockResolvedValue({ id: 5, grade: "2" } as any);

    await expect(
      controller.updateStudent(user, 5, { grade: "2" } as any),
    ).resolves.toEqual({ id: 5, grade: "2" });
    expect(service.update).toHaveBeenCalledWith(user, 5, { grade: "2" });
  });

  it("deleteStudent should call service", async () => {
    const user = { id: 1, role: Role.PARENT };
    service.remove.mockResolvedValue({ id: 5, isActive: false } as any);

    await expect(controller.deleteStudent(user, 5)).resolves.toEqual({
      id: 5,
      isActive: false,
    });
    expect(service.remove).toHaveBeenCalledWith(user, 5);
  });

  it("unlinkCard should call service", async () => {
    const user = { id: 1, role: Role.PARENT };
    service.unlinkCard.mockResolvedValue({ id: 5, cardNumber: null } as any);

    await expect(controller.unlinkCard(user, 5)).resolves.toEqual({
      id: 5,
      cardNumber: null,
    });
    expect(service.unlinkCard).toHaveBeenCalledWith(user, 5);
  });

  it("getStudentOrders should call service", async () => {
    const user = { id: 1, role: Role.PARENT };
    service.getStudentOrders.mockResolvedValue([{ id: 100 }] as any);

    await expect(controller.getStudentOrders(user, 5)).resolves.toEqual([
      { id: 100 },
    ]);
    expect(service.getStudentOrders).toHaveBeenCalledWith(user, 5);
  });
});
