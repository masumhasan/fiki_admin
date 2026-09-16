import { uploadOptimizedFile } from "./imageOptimization";

/**
 * Uploads a base64 / data URL image to AWS S3 as a binary multipart file.
 * NOTE: Base64 is converted to a binary Blob client-side and uploaded directly to S3.
 * No base64 data is ever sent in the request body or stored in the database.
 */
export async function uploadBase64Image(
  base64: string,
  category: string,
  token?: string
): Promise<string> {
  if (!base64) return base64;
  if (!base64.startsWith("data:image/")) {
    return base64; // Already an S3 URL or external URL
  }

  return uploadOptimizedFile(base64, {
    category,
    token,
    preset: category === "signatures" ? "signature" : "general",
  });
}
