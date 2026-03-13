import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class LinkCardDto {
  @IsString()
  @IsNotEmpty({ message: "Mã thẻ là bắt buộc" })
  @MaxLength(50)
  cardNumber: string;
}
