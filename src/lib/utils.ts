import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizePhoneInput(val: string): string {
  if (!val) return "";
  const hasLeadingPlus = val.trim().startsWith("+");
  const digits = val.replace(/[^\d]/g, "");
  return hasLeadingPlus ? `+${digits}` : digits;
}
