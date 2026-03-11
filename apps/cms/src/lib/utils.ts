import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format phone number from international format (+84) to Vietnamese domestic format (0)
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null;

  // Convert +84 to 0 for Vietnamese phone numbers
  if (phone.startsWith("+84")) {
    return "0" + phone.slice(3);
  }

  return phone;
}
