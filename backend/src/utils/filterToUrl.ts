import path from "path";

export function filePathToUrl(filePath: string, baseUrl: string): string {
  if (!filePath) return "";
  // Ensure the file path uses forward slashes
  const normalizedPath = filePath.replace(/\\/g, "/");
  // Remove any leading slash to avoid double slashes
  const cleanPath = normalizedPath.replace(/^\//, "");
  return `${baseUrl}/${cleanPath}`;
}
