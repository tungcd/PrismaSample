import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { compare, hash } from "bcrypt";
import { AuthService } from "../../src/auth/auth.service";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;

  const prisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const jwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prisma as any, jwtService as any);
  });

  it("validateUser should return null when credentials invalid", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.validateUser("a@b.com", "123")).resolves.toBeNull();
  });

  it("validateUser should return user when password is valid", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: "a@b.com",
      role: "PARENT",
      passwordHash: "hash",
    });
    (compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser("a@b.com", "123");

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
    expect(result).toEqual(
      expect.objectContaining({ id: 1, email: "a@b.com", role: "PARENT" }),
    );
  });

  it("validateUser should return null when user has no passwordHash", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: "a@b.com",
      passwordHash: null,
    });

    await expect(service.validateUser("a@b.com", "123")).resolves.toBeNull();
  });

  it("validateUser should return null when password mismatch", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: "a@b.com",
      passwordHash: "hash",
    });
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(service.validateUser("a@b.com", "wrong")).resolves.toBeNull();
  });

  it("login should sign token and return user payload", async () => {
    jwtService.sign.mockReturnValue("jwt-token");

    const result = await service.login({
      id: 1,
      email: "a@b.com",
      role: "PARENT",
      name: "A",
      phone: "123",
      avatar: "x",
    });

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 1,
      email: "a@b.com",
      role: "PARENT",
    });
    expect(result.access_token).toBe("jwt-token");
  });

  it("verifyToken should return payload when token valid", async () => {
    jwtService.verify.mockReturnValue({ sub: 1 });

    await expect(service.verifyToken("ok")).resolves.toEqual({ sub: 1 });
  });

  it("verifyToken should throw UnauthorizedException for bad token", async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error("bad");
    });

    await expect(service.verifyToken("bad-token")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("forgotPassword should return generic success for unknown email", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    const result = await service.forgotPassword("x@y.com");

    expect(result.success).toBe(true);
    expect(result.message).toContain("Nếu email tồn tại");
  });

  it("forgotPassword should update token for existing email", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 7, email: "x@y.com" });
    prisma.user.update.mockResolvedValue({});

    const result = await service.forgotPassword("x@y.com");

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 7 },
        data: expect.objectContaining({
          resetToken: expect.any(String),
          resetTokenExpiry: expect.any(Date),
        }),
      }),
    );
    expect(result.success).toBe(true);
  });

  it("resetPassword should throw when token invalid", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.resetPassword("bad", "newpass"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("resetPassword should hash and update password", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 10 });
    (hash as jest.Mock).mockResolvedValue("new-hash");

    const result = await service.resetPassword("good", "newpass");

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({ passwordHash: "new-hash" }),
      }),
    );
    expect(result.success).toBe(true);
  });
});
