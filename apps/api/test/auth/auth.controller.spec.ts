import { AuthController } from "../../src/auth/auth.controller";
import { AuthService } from "../../src/auth/auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(() => {
    service = {
      login: jest.fn(),
      verifyToken: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      validateUser: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    controller = new AuthController(service);
  });

  it("login should call service.login", async () => {
    service.login.mockResolvedValue({ access_token: "token" } as any);

    await expect(
      controller.login(
        { user: { id: 1, email: "a@b.com", role: "PARENT" } } as any,
        {} as any,
      ),
    ).resolves.toEqual({ access_token: "token" });
  });

  it("verify should return payload", async () => {
    service.verifyToken.mockResolvedValue({ sub: 1 } as any);

    await expect(controller.verify("t")).resolves.toEqual({
      valid: true,
      payload: { sub: 1 },
    });
  });

  it("forgotPassword should call service", async () => {
    service.forgotPassword.mockResolvedValue({ success: true } as any);

    await expect(
      controller.forgotPassword({ email: "a@b.com" } as any),
    ).resolves.toEqual({
      success: true,
    });
    expect(service.forgotPassword).toHaveBeenCalledWith("a@b.com");
  });

  it("refresh should call login with current user", async () => {
    service.login.mockResolvedValue({ access_token: "new-token" } as any);

    await expect(
      controller.refresh({ user: { id: 2 } } as any),
    ).resolves.toEqual({
      access_token: "new-token",
    });
    expect(service.login).toHaveBeenCalledWith({ id: 2 });
  });

  it("logout should return success payload", async () => {
    await expect(controller.logout()).resolves.toEqual({
      success: true,
      message: "Đăng xuất thành công",
    });
  });

  it("resetPassword should call service", async () => {
    service.resetPassword.mockResolvedValue({ success: true } as any);

    await expect(
      controller.resetPassword({ token: "abc", newPassword: "123456" } as any),
    ).resolves.toEqual({ success: true });
    expect(service.resetPassword).toHaveBeenCalledWith("abc", "123456");
  });
});
