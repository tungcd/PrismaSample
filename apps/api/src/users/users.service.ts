import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { compare, hash } from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdateNotificationSettingsDto } from "./dto/update-notification-settings.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    if (!Object.keys(dto).length) {
      throw new BadRequestException("Không có dữ liệu để cập nhật");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    const isPasswordValid = await compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Mật khẩu hiện tại không đúng");
    }

    const isSamePassword = await compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestException("Mật khẩu mới phải khác mật khẩu hiện tại");
    }

    const passwordHash = await hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return {
      success: true,
      message: "Đổi mật khẩu thành công",
    };
  }

  async getNotificationSettings(_userId: number) {
    // Phase 1 stub - returns defaults. Full persistence added in Phase 4.
    return {
      push: {
        orderStatus: true,
        lowBalance: true,
        promotions: false,
      },
      email: {
        orderStatus: true,
        lowBalance: false,
        promotions: false,
      },
    };
  }

  async updateNotificationSettings(
    _userId: number,
    dto: UpdateNotificationSettingsDto,
  ) {
    // Phase 1 stub - echoes settings back. DB persistence added in Phase 4.
    return {
      success: true,
      message: "Đã cập nhật cài đặt thông báo",
      settings: dto,
    };
  }
}
