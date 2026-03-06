import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMediaUrl(path: string | undefined) {
  if (!path) return "";
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  // Remove trailing slashes from baseUrl and leading slashes from path
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedPath}`;
}
