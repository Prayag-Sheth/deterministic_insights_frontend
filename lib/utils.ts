import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Shorten a UUID for compact display (e.g. breadcrumbs, fallback labels). */
export function truncateId(id: string): string {
  return `${id.slice(0, 8)}…`;
}
