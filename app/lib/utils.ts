/**
 * Formats a file size in bytes to a human-readable string
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes: string[] = ["Bytes", "KB", "MB", "GB", "TB"];

  // Determine appropriate unit
  const i: number = Math.floor(Math.log(bytes) / Math.log(k));

  // Format to 2 decimal places
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
    " " +
    sizes[i]
  );
}

export const generateUUID = (): string => crypto.randomUUID();