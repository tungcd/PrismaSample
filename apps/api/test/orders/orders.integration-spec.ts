import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { PrismaService } from "../../src/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import {
  Role,
  OrderStatus,
  TransactionType,
  ProductStatus,
  DiscountType,
} from "@prisma/client";

describe("OrdersController (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let parentToken: string;
  let studentToken: string;
  let parentUserId: number;
  let studentUserId: number;
  let studentId: number;
  let productId: number;
  let voucherId: number;
  let walletId: number;
  let cartId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix("api/v1");

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test parent user
    const hashedPassword = await bcrypt.hash("Parent123!", 10);
    const parentUser = await prisma.user.create({
      data: {
        email: "parent-order-test@example.com",
        password: hashedPassword,
        name: "Parent Order Test",
        role: Role.PARENT,
        phoneNumber: "9876543210",
      },
    });
    parentUserId = parentUser.id;

    // Create test student user
    const studentUser = await prisma.user.create({
      data: {
        email: "student-order-test@example.com",
        password: await bcrypt.hash("Student123!", 10),
        name: "Student Order Test",
        role: Role.STUDENT,
        phoneNumber: "1231231234",
      },
    });
    studentUserId = studentUser.id;

    // Create student profile linked to parent
    const student = await prisma.student.create({
      data: {
        userId: studentUserId,
        parentId: parentUserId,
        studentId: "STU-INT-001",
        name: "Student Order Test",
        grade: "10A",
        avatar: null,
      },
    });
    studentId = student.id;

    // Create wallet for student
    const wallet = await prisma.wallet.create({
      data: {
        studentId: studentId,
        balance: 500000, // 500k VND
      },
    });
    walletId = wallet.id;

    // Create test product
    const product = await prisma.product.create({
      data: {
        name: "Test Sandwich",
        description: "Delicious test sandwich",
        price: 25000,
        stock: 100,
        categoryId: 1,
        imageUrl: "http://example.com/sandwich.jpg",
        status: ProductStatus.AVAILABLE,
      },
    });
    productId = product.id;

    // Create voucher
    const voucher = await prisma.voucher.create({
      data: {
        code: "TESTINT20",
        description: "Test Integration 20% off",
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        maxDiscount: 10000,
        minAmount: 20000,
        usageLimit: 10,
        usedCount: 0,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
      },
    });
    voucherId = voucher.id;

    // Create cart for student
    const cart = await prisma.cart.create({
      data: {
        studentId: studentId,
      },
    });
    cartId = cart.id;

    // Login as parent
    const parentLoginRes = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email: "parent-order-test@example.com",
        password: "Parent123!",
      });
    parentToken = parentLoginRes.body.access_token;

    // Login as student
    const studentLoginRes = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email: "student-order-test@example.com",
        password: "Student123!",
      });
    studentToken = studentLoginRes.body.access_token;
  });

  afterAll(async () => {
    // Cleanup in reverse dependency order
    await prisma.orderItem.deleteMany({ where: { order: { studentId } } });
    await prisma.order.deleteMany({ where: { studentId } });
    await prisma.cartItem.deleteMany({ where: { cartId } });
    await prisma.cart.delete({ where: { id: cartId } }).catch(() => {});
    await prisma.transaction.deleteMany({ where: { walletId } });
    await prisma.wallet.delete({ where: { id: walletId } }).catch(() => {});
    await prisma.student.delete({ where: { id: studentId } }).catch(() => {});
    await prisma.product.delete({ where: { id: productId } }).catch(() => {});
    await prisma.voucher.delete({ where: { id: voucherId } }).catch(() => {});
    await prisma.user.delete({ where: { id: studentUserId } }).catch(() => {});
    await prisma.user.delete({ where: { id: parentUserId } }).catch(() => {});
    await prisma.$disconnect();
    await app.close();
  });

  describe("Complete Order Checkout Flow", () => {
    let orderId: number;

    beforeEach(async () => {
      // Reset wallet balance
      await prisma.wallet.update({
        where: { id: walletId },
        data: { balance: 500000 },
      });

      // Reset product stock
      await prisma.product.update({
        where: { id: productId },
        data: { stock: 100 },
      });

      // Clear cart items
      await prisma.cartItem.deleteMany({ where: { cartId } });
    });

    it("should complete full checkout flow: add to cart → create order → verify wallet deduction → verify stock deduction", async () => {
      // Step 1: Add item to cart
      await request(app.getHttpServer())
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          productId: productId,
          quantity: 2,
        })
        .expect(201);

      // Step 2: Create order from cart
      const createOrderRes = await request(app.getHttpServer())
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          studentId: studentId,
          note: "Integration test order",
        })
        .expect(201);

      orderId = createOrderRes.body.id;

      // Verify order structure
      expect(createOrderRes.body).toMatchObject({
        studentId: studentId,
        status: OrderStatus.PENDING,
        totalAmount: 50000, // 2 * 25000
        note: "Integration test order",
      });
      expect(createOrderRes.body.items).toHaveLength(1);
      expect(createOrderRes.body.items[0]).toMatchObject({
        productId: productId,
        quantity: 2,
        price: 25000,
      });

      // Step 3: Verify wallet balance deducted
      const walletAfter = await prisma.wallet.findUnique({
        where: { id: walletId },
      });
      expect(walletAfter.balance).toBe(450000); // 500000 - 50000

      // Step 4: Verify transaction created
      const transaction = await prisma.transaction.findFirst({
        where: {
          walletId: walletId,
          type: TransactionType.PAYMENT,
          amount: -50000,
        },
      });
      expect(transaction).toBeDefined();
      expect(transaction.description).toContain("order");

      // Step 5: Verify product stock deducted
      const productAfter = await prisma.product.findUnique({
        where: { id: productId },
      });
      expect(productAfter.stock).toBe(98); // 100 - 2

      // Step 6: Verify cart is cleared
      const cartItems = await prisma.cartItem.findMany({
        where: { cartId },
      });
      expect(cartItems).toHaveLength(0);
    });

    it("should fail order creation with insufficient wallet balance", async () => {
      // Set low wallet balance
      await prisma.wallet.update({
        where: { id: walletId },
        data: { balance: 10000 }, // Less than product price
      });

      // Add item to cart
      await request(app.getHttpServer())
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          productId: productId,
          quantity: 1,
        })
        .expect(201);

      // Attempt to create order
      await request(app.getHttpServer())
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          studentId: studentId,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain("Insufficient wallet balance");
        });

      // Verify wallet balance unchanged
      const walletAfter = await prisma.wallet.findUnique({
        where: { id: walletId },
      });
      expect(walletAfter.balance).toBe(10000);

      // Verify no order created
      const orders = await prisma.order.findMany({
        where: { studentId, status: OrderStatus.PENDING },
      });
      expect(orders).toHaveLength(0);
    });

    it("should fail order creation with insufficient product stock", async () => {
      // Set low stock
      await prisma.product.update({
        where: { id: productId },
        data: { stock: 1 },
      });

      // Add more items than available
      await request(app.getHttpServer())
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          productId: productId,
          quantity: 5, // More than stock
        })
        .expect(201);

      // Attempt to create order
      await request(app.getHttpServer())
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          studentId: studentId,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain("Insufficient stock");
        });

      // Verify stock unchanged
      const productAfter = await prisma.product.findUnique({
        where: { id: productId },
      });
      expect(productAfter.stock).toBe(1);

      // Verify wallet balance unchanged
      const walletAfter = await prisma.wallet.findUnique({
        where: { id: walletId },
      });
      expect(walletAfter.balance).toBe(500000);
    });

    it("should apply voucher and calculate correct discount", async () => {
      // Add item to cart
      await request(app.getHttpServer())
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          productId: productId,
          quantity: 2, // 50000 total
        })
        .expect(201);

      // Create order
      const createOrderRes = await request(app.getHttpServer())
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          studentId: studentId,
        })
        .expect(201);

      orderId = createOrderRes.body.id;

      // Apply voucher (20% off, max 10000)
      const applyVoucherRes = await request(app.getHttpServer())
        .post(`/api/v1/orders/${orderId}/voucher`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          voucherCode: "TESTINT20",
        })
        .expect(200);

      // 50000 * 20% = 10000 (within max discount limit)
      expect(applyVoucherRes.body.voucherDiscount).toBe(10000);
      expect(applyVoucherRes.body.totalAmount).toBe(40000); // 50000 - 10000

      // Verify voucher usage incremented
      const voucherAfter = await prisma.voucher.findUnique({
        where: { id: voucherId },
      });
      expect(voucherAfter.usedCount).toBe(1);

      // Verify order in database
      const orderAfter = await prisma.order.findUnique({
        where: { id: orderId },
      });
      expect(orderAfter.voucherId).toBe(voucherId);
      expect(orderAfter.voucherDiscount).toBe(10000);
    });

    it("should handle order cancellation with refund", async () => {
      // Create order first
      await request(app.getHttpServer())
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          productId: productId,
          quantity: 1,
        })
        .expect(201);

      const createOrderRes = await request(app.getHttpServer())
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          studentId: studentId,
        })
        .expect(201);

      orderId = createOrderRes.body.id;
      const initialBalance = 500000 - 25000; // After order

      // Cancel order
      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}/cancel`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(OrderStatus.CANCELLED);
        });

      // Verify refund transaction created
      const refundTransaction = await prisma.transaction.findFirst({
        where: {
          walletId: walletId,
          type: TransactionType.REFUND,
          amount: 25000,
        },
      });
      expect(refundTransaction).toBeDefined();
      expect(refundTransaction.description).toContain("refund");

      // Verify wallet balance restored
      const walletAfter = await prisma.wallet.findUnique({
        where: { id: walletId },
      });
      expect(walletAfter.balance).toBe(500000); // Full refund

      // Verify product stock restored
      const productAfter = await prisma.product.findUnique({
        where: { id: productId },
      });
      expect(productAfter.stock).toBe(100); // Stock returned
    });

    it("should prevent cancellation of non-pending orders", async () => {
      // Create and complete order
      await request(app.getHttpServer())
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          productId: productId,
          quantity: 1,
        })
        .expect(201);

      const createOrderRes = await request(app.getHttpServer())
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          studentId: studentId,
        })
        .expect(201);

      orderId = createOrderRes.body.id;

      // Manually update order status to COMPLETED (simulating delivery)
      await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.COMPLETED },
      });

      // Attempt to cancel
      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}/cancel`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            "Only pending orders can be cancelled",
          );
        });

      // Verify order still completed
      const orderAfter = await prisma.order.findUnique({
        where: { id: orderId },
      });
      expect(orderAfter.status).toBe(OrderStatus.COMPLETED);
    });

    it("should allow parent to view their student orders", async () => {
      // Create order as student
      await request(app.getHttpServer())
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          productId: productId,
          quantity: 1,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          studentId: studentId,
        })
        .expect(201);

      // Parent retrieves orders
      await request(app.getHttpServer())
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${parentToken}`)
        .query({ studentId: studentId })
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBeGreaterThan(0);
          expect(res.body.items[0].studentId).toBe(studentId);
        });
    });

    it("should handle reorder functionality correctly", async () => {
      // Create original order
      await request(app.getHttpServer())
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          productId: productId,
          quantity: 3,
        })
        .expect(201);

      const createOrderRes = await request(app.getHttpServer())
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          studentId: studentId,
        })
        .expect(201);

      orderId = createOrderRes.body.id;

      // Clear cart
      await prisma.cartItem.deleteMany({ where: { cartId } });

      // Reorder
      await request(app.getHttpServer())
        .post(`/api/v1/orders/${orderId}/reorder`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(201);

      // Verify items added back to cart
      const cartItems = await prisma.cartItem.findMany({
        where: { cartId },
        include: { product: true },
      });

      expect(cartItems).toHaveLength(1);
      expect(cartItems[0].productId).toBe(productId);
      expect(cartItems[0].quantity).toBe(3);
    });
  });

  describe("Order Query Filters", () => {
    beforeAll(async () => {
      // Clear existing orders
      await prisma.orderItem.deleteMany({ where: { order: { studentId } } });
      await prisma.order.deleteMany({ where: { studentId } });

      // Create orders with different dates and statuses
      await prisma.order.create({
        data: {
          studentId: studentId,
          status: OrderStatus.PENDING,
          totalAmount: 25000,
          createdAt: new Date("2026-03-01"),
          items: {
            create: {
              productId: productId,
              quantity: 1,
              price: 25000,
            },
          },
        },
      });

      await prisma.order.create({
        data: {
          studentId: studentId,
          status: OrderStatus.COMPLETED,
          totalAmount: 50000,
          createdAt: new Date("2026-03-05"),
          items: {
            create: {
              productId: productId,
              quantity: 2,
              price: 25000,
            },
          },
        },
      });

      await prisma.order.create({
        data: {
          studentId: studentId,
          status: OrderStatus.CANCELLED,
          totalAmount: 75000,
          createdAt: new Date("2026-03-10"),
          items: {
            create: {
              productId: productId,
              quantity: 3,
              price: 25000,
            },
          },
        },
      });
    });

    it("should filter orders by date range", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${studentToken}`)
        .query({
          studentId: studentId,
          fromDate: "2026-03-02",
          toDate: "2026-03-09",
        })
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].status).toBe(OrderStatus.COMPLETED);
    });

    it("should filter orders by status", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${studentToken}`)
        .query({
          studentId: studentId,
          status: OrderStatus.PENDING,
        })
        .expect(200);

      expect(res.body.items.length).toBeGreaterThan(0);
      res.body.items.forEach((order) => {
        expect(order.status).toBe(OrderStatus.PENDING);
      });
    });

    it("should combine multiple filters", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${studentToken}`)
        .query({
          studentId: studentId,
          status: OrderStatus.COMPLETED,
          fromDate: "2026-03-01",
          toDate: "2026-03-31",
        })
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].status).toBe(OrderStatus.COMPLETED);
    });
  });
});
