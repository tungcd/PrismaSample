import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class OrderItemInputDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items?: OrderItemInputDto[];

  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  /**
   * If true, use the server-side in-memory cart instead of body `items`.
   */
  @IsOptional()
  @IsBoolean()
  useCart?: boolean;
}
