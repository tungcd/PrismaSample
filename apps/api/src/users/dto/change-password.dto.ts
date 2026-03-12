import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: "Mật khẩu hiện tại là bắt buộc" })
  currentPassword: string;

  @IsString()
  @IsNotEmpty({ message: "Mật khẩu mới là bắt buộc" })
  @MinLength(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" })
  newPassword: string;
}
