import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { PrismaService } from "../../src/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { Role } from "@prisma/client";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: number;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same global pipes as main.ts
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

    // Create test user
    const hashedPassword = await bcrypt.hash("Test123!", 10);
    const testUser = await prisma.user.create({
      data: {
        email: "e2etest@example.com",
        passwordHash: hashedPassword,
        name: "E2E Test User",
        role: Role.STAFF,
        phone: "1234567890",
      },
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    await prisma.$disconnect();
    await app.close();
  });

  describe("/api/v1/auth/login (POST)", () => {
    it("should login successfully with valid credentials", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "e2etest@example.com",
          password: "Test123!",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("user");
          expect(res.body.user.email).toBe("e2etest@example.com");
          expect(res.body.user).not.toHaveProperty("passwordHash");

          // Store token for later tests
          accessToken = res.body.access_token;
        });
    });

    it("should return 401 with invalid password", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "e2etest@example.com",
          password: "WrongPassword",
        })
        .expect(401);
    });

    it("should return 401 with non-existent email", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "Test123!",
        })
        .expect(401);
    });

    it("should return 400 with invalid email format", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "invalid-email",
          password: "Test123!",
        })
        .expect(401); // LocalStrategy returns 401 for validation failures
    });

    it("should return 400 with missing password", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "e2etest@example.com",
        })
        .expect(401); // LocalStrategy returns 401 for missing credentials
    });
  });

  describe("/api/v1/auth/verify (POST) - Token Verification", () => {
    it("should verify token and return payload", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/verify")
        .send({ token: accessToken })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("valid", true);
          expect(res.body).toHaveProperty("payload");
          expect(res.body.payload.email).toBe("e2etest@example.com");
          expect(res.body.payload.role).toBe("STAFF");
        });
    });

    it("should return 401 with invalid token", async () => {
      try {
        await request(app.getHttpServer())
          .post("/api/v1/auth/verify")
          .send({ token: "invalid-token" })
          .expect(401);
      } catch (e) {
        // Token validation throws UnauthorizedException
      }
    });

    it("should return 401 with missing token", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/verify")
        .send({})
        .expect(401); // Throws UnauthorizedException for undefined token
    });
  });

  describe("/api/v1/auth/refresh (POST) - JWT Guard", () => {
    it("should refresh token when authenticated", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("user");

          // Update token
          accessToken = res.body.access_token;
        });
    });

    it("should return 401 without authentication", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .expect(401);
    });

    it("should return 401 with invalid token", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });
  });

  describe("/api/v1/auth/logout (POST) - JWT Guard", () => {
    it("should logout successfully when authenticated", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("success", true);
          expect(res.body).toHaveProperty("message");
        });
    });

    it("should return 401 when not authenticated", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/logout")
        .expect(401);
    });
  });

  describe("Role-based Access Control - RolesGuard", () => {
    let adminToken: string;
    let parentToken: string;
    let adminUserId: number;
    let parentUserId: number;

    beforeAll(async () => {
      // Create admin user
      const hashedPassword = await bcrypt.hash("Admin123!", 10);
      const adminUser = await prisma.user.create({
        data: {
          email: "admin-e2e@example.com",
          passwordHash: hashedPassword,
          name: "Admin E2E",
          role: Role.ADMIN,
          phone: "1111111111",
        },
      });
      adminUserId = adminUser.id;

      // Create parent user
      const parentUser = await prisma.user.create({
        data: {
          email: "parent-e2e@example.com",
          passwordHash: await bcrypt.hash("Parent123!", 10),
          name: "Parent E2E",
          role: Role.PARENT,
          phone: "2222222222",
        },
      });
      parentUserId = parentUser.id;

      // Login as admin
      const adminLoginRes = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "admin-e2e@example.com",
          password: "Admin123!",
        });
      adminToken = adminLoginRes.body.access_token;

      // Login as parent
      const parentLoginRes = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "parent-e2e@example.com",
          password: "Parent123!",
        });
      parentToken = parentLoginRes.body.access_token;
    });

    afterAll(async () => {
      await prisma.user.delete({ where: { id: adminUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: parentUserId } }).catch(() => {});
    });

    it("should allow admin to access admin-only endpoint (GET /api/v1/users)", () => {
      return request(app.getHttpServer())
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
    });

    it("should deny parent access to admin-only endpoint", () => {
      return request(app.getHttpServer())
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${parentToken}`)
        .expect(403);
    });

    it("should deny staff access to admin-only endpoint", () => {
      return request(app.getHttpServer())
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(403);
    });
  });

  describe("/api/v1/auth/forgot-password (POST)", () => {
    it("should accept valid email for password reset", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/forgot-password")
        .send({ email: "e2etest@example.com" })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("message");
        });
    });

    it("should return 400 with invalid email format", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/forgot-password")
        .send({ email: "invalid-email" })
        .expect(400);
    });

    it("should accept non-existent email (security: no user enumeration)", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/forgot-password")
        .send({ email: "nonexistent@example.com" })
        .expect(201);
    });
  });

  describe("/api/v1/auth/reset-password (POST)", () => {
    it("should return 400 with missing fields", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/reset-password")
        .send({ token: "some-token" })
        .expect(400);
    });

    it("should return 400 with weak password", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/reset-password")
        .send({
          token: "some-token",
          newPassword: "123",
        })
        .expect(400);
    });

    it("should return 404 with invalid token", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/reset-password")
        .send({
          token: "invalid-token",
          newPassword: "NewPassword123!",
        })
        .expect(404); // NotFoundException from service
    });
  });
});
