import { IsInt, IsOptional, Min } from "class-validator";

export class AddToCartDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsInt()
  studentId?: number;
}
