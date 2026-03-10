import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error = "InternalServerError";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      }
    } else if (exception instanceof Error) {
      // Prisma errors
      if ("code" in exception) {
        const prismaError = exception as any;
        switch (prismaError.code) {
          case "P2002":
            status = HttpStatus.CONFLICT;
            message = "Dữ liệu đã tồn tại";
            error = "Conflict";
            break;
          case "P2025":
            status = HttpStatus.NOT_FOUND;
            message = "Không tìm thấy dữ liệu";
            error = "NotFound";
            break;
          default:
            message = "Lỗi cơ sở dữ liệu";
        }
      } else {
        // Show detailed error only in development
        message =
          process.env.NODE_ENV === "development"
            ? exception.message
            : "Có lỗi xảy ra";
      }
    }

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("Exception caught:", exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
