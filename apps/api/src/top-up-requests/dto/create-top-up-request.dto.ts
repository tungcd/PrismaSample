import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateTopUpRequestDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  amount: number;

  @IsOptional()
  @IsString()
  proofImage?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
