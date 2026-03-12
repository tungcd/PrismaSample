import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "Tên không được vượt quá 100 ký tự" })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: "Số điện thoại không hợp lệ" })
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
