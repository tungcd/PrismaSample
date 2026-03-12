import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  cardNumber?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsBoolean({ message: "isActive phải là true hoặc false" })
  isActive?: boolean;
}
