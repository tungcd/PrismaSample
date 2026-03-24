import { IsNumber, IsEnum } from 'class-validator';
import { MemberRole } from '@smart-canteen/prisma';

export class UpdateMemberRoleDto {
  @IsNumber()
  userId: number;

  @IsEnum(MemberRole)
  role: MemberRole;
}
