/**
 * Formats an ISO date string to a full word format.
 * Example: "2025-10-01" → "October 1, 2025"
 */
export function formatDateLong(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats an ISO date string to a short numeric format.
 * Example: "2025-10-01" → "10/1/2025"
 */
export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

/**
 * @deprecated Use formatDateLong instead
 */
export function formatDate(dateString: string): string {
  return formatDateLong(dateString);
}
