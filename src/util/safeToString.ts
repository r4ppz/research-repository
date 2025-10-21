/**
 * Safely converts any value to a displayable string
 * @param value - The value to convert to string
 * @returns A string representation of the value
 */
export function safeToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  // For objects/arrays, return a more descriptive string or JSON representation
  try {
    return JSON.stringify(value);
  } catch {
    // If JSON.stringify fails, return a simple string
    return "[Object]";
  }
}
