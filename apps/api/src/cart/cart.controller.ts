import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

@Controller("cart")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser() user: any) {
    return this.cartService.getCartWithDetails(user.id);
  }

  @Post("items")
  async addItem(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    this.cartService.addItem(
      user.id,
      dto.productId,
      dto.quantity,
      dto.studentId,
    );
    return this.cartService.getCartWithDetails(user.id);
  }

  @Patch("items/:itemId")
  async updateItem(
    @CurrentUser() user: any,
    @Param("itemId", ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    this.cartService.updateItem(user.id, itemId, dto.quantity);
    return this.cartService.getCartWithDetails(user.id);
  }

  @Delete("items/:itemId")
  async removeItem(
    @CurrentUser() user: any,
    @Param("itemId", ParseIntPipe) itemId: number,
  ) {
    this.cartService.removeItem(user.id, itemId);
    return this.cartService.getCartWithDetails(user.id);
  }

  @Delete()
  async clearCart(@CurrentUser() user: any) {
    this.cartService.clearCart(user.id);
    return { success: true, message: "Đã xóa giỏ hàng" };
  }

  @Post("validate")
  async validateCart(@CurrentUser() user: any) {
    return this.cartService.validateCart(user.id);
  }
}
