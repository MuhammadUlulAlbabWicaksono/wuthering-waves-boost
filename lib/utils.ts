import { type ClassValue, clsx } from "clsx";

/**
 * Utility function to merge Tailwind class names.
 * Combines clsx for conditional classes.
 * Can be extended with tailwind-merge if needed later.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
