import { ReportsService } from "../../src/reports/reports.service";

describe("ReportsService", () => {
  let service: ReportsService;

  const prisma = {
    order: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService(prisma as any);
  });

  it("spendingSummary should aggregate by day", async () => {
    prisma.order.findMany.mockResolvedValue([
      { total: 10, createdAt: new Date("2026-03-01T00:00:00.000Z") },
      { total: 20, createdAt: new Date("2026-03-01T01:00:00.000Z") },
      { total: 5, createdAt: new Date("2026-03-02T00:00:00.000Z") },
    ]);

    const result = await service.spendingSummary(1, {} as any);

    expect(result.total).toBe(35);
    expect(result.byDay["2026-03-01"]).toBe(30);
    expect(result.byDay["2026-03-02"]).toBe(5);
  });

  it("studentConsumption should summarize per student", async () => {
    prisma.order.findMany.mockResolvedValue([
      {
        studentId: 1,
        student: { id: 1, name: "A", grade: "1" },
        total: 30,
        items: [{ quantity: 2 }, { quantity: 1 }],
      },
      {
        studentId: 1,
        student: { id: 1, name: "A", grade: "1" },
        total: 20,
        items: [{ quantity: 3 }],
      },
    ]);

    const result = await service.studentConsumption(1, {} as any);

    expect(result).toHaveLength(1);
    expect(result[0].totalSpent).toBe(50);
    expect(result[0].orderCount).toBe(2);
    expect(result[0].totalItems).toBe(6);
  });

  it("nutritionOverview should sum nutrition by quantity", async () => {
    prisma.order.findMany.mockResolvedValue([
      {
        items: [
          {
            quantity: 2,
            product: { calories: 10, protein: 1, carbs: 2, fat: 3 },
          },
          {
            quantity: 1,
            product: { calories: null, protein: null, carbs: null, fat: null },
          },
        ],
      },
    ]);

    const result = await service.nutritionOverview(1, {} as any);

    expect(result.calories).toBe(20);
    expect(result.protein).toBe(2);
    expect(result.carbs).toBe(4);
    expect(result.fat).toBe(6);
    expect(result.orderCount).toBe(1);
  });

  it("spendingSummary should pass date and student filters", async () => {
    prisma.order.findMany.mockResolvedValue([]);

    await service.spendingSummary(1, {
      studentId: 2,
      fromDate: "2026-03-01",
      toDate: "2026-03-31",
    } as any);

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 1,
          studentId: 2,
          createdAt: {
            gte: new Date("2026-03-01"),
            lte: new Date("2026-03-31"),
          },
        }),
      }),
    );
  });

  it("nutritionOverview should return zeros when no orders", async () => {
    prisma.order.findMany.mockResolvedValue([]);

    const result = await service.nutritionOverview(1, {} as any);

    expect(result).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      orderCount: 0,
    });
  });
});
