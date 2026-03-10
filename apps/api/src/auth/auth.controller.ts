import { Controller, Post, UseGuards, Request, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard("local"))
  @Post("login")
  async login(@Request() req, @Body() _loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Post("verify")
  async verify(@Body("token") token: string) {
    const payload = await this.authService.verifyToken(token);
    return { valid: true, payload };
  }
}
