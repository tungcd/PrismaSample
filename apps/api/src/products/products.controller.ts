import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ProductsService } from "./products.service";
import { QueryProductsDto } from "./dto/query-products.dto";

@Controller("products")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  // Must come BEFORE :id to avoid route conflict
  @Get("featured")
  async findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
}
