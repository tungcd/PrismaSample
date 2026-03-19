import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response, Request } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error = "InternalServerError";
    let details: any = undefined;

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
          case "P2003":
            status = HttpStatus.BAD_REQUEST;
            message = "Dữ liệu không hợp lệ - vi phạm ràng buộc";
            error = "BadRequest";
            break;
          case "P2011":
            status = HttpStatus.BAD_REQUEST;
            message = "Thiếu dữ liệu bắt buộc";
            error = "BadRequest";
            break;
          case "P2014":
            status = HttpStatus.BAD_REQUEST;
            message = "Quan hệ dữ liệu không hợp lệ";
            error = "BadRequest";
            break;
          default:
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = "Lỗi cơ sở dữ liệu";
            error = "DatabaseError";
        }

        // Log detailed Prisma error for debugging
        this.logger.error(
          `Prisma Error [${prismaError.code}]: ${prismaError.message}`,
          prismaError.stack,
        );
      } else {
        // Generic error - log details but don't expose to client
        message = "Có lỗi xảy ra khi xử lý yêu cầu";
        error = "InternalError";

        // Log full error details for debugging
        this.logger.error(
          `Unhandled Error: ${exception.message}`,
          exception.stack,
        );
      }
    } else {
      // Unknown error type
      this.logger.error("Unknown exception type:", exception);
    }

    // Log request context for debugging
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Error: ${error}`,
    );

    // Always return clean response (no stack traces)
    const responseBody: any = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Only add details in development mode
    if (process.env.NODE_ENV === "development" && details) {
      responseBody.details = details;
    }

    response.status(status).json(responseBody);
  }
}
