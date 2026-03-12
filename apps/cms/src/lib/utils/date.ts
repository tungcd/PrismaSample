/**
 * Common date formatting utilities to avoid hydration errors
 * Uses consistent timezone for both server and client rendering
 * Always wrap date renders in suppressHydrationWarning attribute
 */

/**
 * Format date and time in Vietnamese format (DD/MM/YYYY HH:mm)
 * Uses Asia/Ho_Chi_Minh timezone for consistency
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
}

/**
 * Format date only in Vietnamese format (DD/MM/YYYY)
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
}

/**
 * Format time only in Vietnamese format (HH:mm)
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
}

/**
 * Format date and time with seconds (DD/MM/YYYY HH:mm:ss)
 */
export function formatDateTimeWithSeconds(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
}
