import { IsOptional, IsNumber } from 'class-validator';

export class MarkAsReadDto {
  @IsOptional()
  @IsNumber()
  lastSeenMessageId?: number;
}
