import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentsService } from "./students.service";

@Controller("students")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.STAFF, Role.PARENT)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  async getStudents(@CurrentUser() user: any) {
    return this.studentsService.findAllForUser(user);
  }

  @Post()
  async createStudent(@CurrentUser() user: any, @Body() dto: CreateStudentDto) {
    return this.studentsService.create(user, dto);
  }

  @Get(":id")
  async getStudent(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.studentsService.findOne(user, id);
  }

  @Patch(":id")
  async updateStudent(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(user, id, dto);
  }
}
