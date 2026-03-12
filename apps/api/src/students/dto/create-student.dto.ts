import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty({ message: "Tên học sinh là bắt buộc" })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty({ message: "Lớp là bắt buộc" })
  grade: string;

  @IsString()
  @IsNotEmpty({ message: "Trường học là bắt buộc" })
  school: string;

  @IsOptional()
  @IsString()
  cardNumber?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsInt({ message: "parentId phải là số nguyên" })
  parentId?: number;
}
