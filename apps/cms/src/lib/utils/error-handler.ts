/**
 * Parse database error và trả về message thân thiện với người dùng
 */
export function parseDbError(error: any): string {
  const errorMessage = error?.message || String(error);

  // Prisma unique constraint error
  if (errorMessage.includes("Unique constraint failed")) {
    if (errorMessage.includes("email")) {
      return "Email này đã được sử dụng";
    }
    if (errorMessage.includes("cardNumber")) {
      return "Số thẻ này đã được sử dụng";
    }
    return "Dữ liệu này đã tồn tại trong hệ thống";
  }

  // Prisma foreign key constraint error
  if (errorMessage.includes("Foreign key constraint")) {
    return "Dữ liệu liên quan không hợp lệ";
  }

  // Prisma record not found
  if (errorMessage.includes("Record to update not found")) {
    return "Không tìm thấy dữ liệu cần cập nhật";
  }

  // Connection errors
  if (errorMessage.includes("connection") || errorMessage.includes("timeout")) {
    return "Lỗi kết nối database. Vui lòng thử lại";
  }

  // Default error
  return "Có lỗi xảy ra. Vui lòng thử lại";
}
