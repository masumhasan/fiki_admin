"use client";

import { API_BASE_URL } from "./api";

export type ImagePreset =
  | "avatar"
  | "signature"
  | "vehicle"
  | "document"
  | "odometer"
  | "general";

export interface PresetConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: "image/webp" | "image/jpeg" | "image/png";
}

export const PRESET_CONFIGS: Record<ImagePreset, PresetConfig> = {
  avatar: { maxWidth: 800, maxHeight: 800, quality: 0.82, format: "image/webp" },
  signature: { maxWidth: 800, maxHeight: 400, quality: 0.90, format: "image/png" },
  vehicle: { maxWidth: 1600, maxHeight: 1200, quality: 0.80, format: "image/webp" },
  document: { maxWidth: 1920, maxHeight: 1440, quality: 0.85, format: "image/webp" },
  odometer: { maxWidth: 1920, maxHeight: 1440, quality: 0.85, format: "image/webp" },
  general: { maxWidth: 1600, maxHeight: 1600, quality: 0.82, format: "image/webp" },
};

export const ACCEPTED_IMAGE_TYPES =
  "image/*,.heic,.heif,.HEIC,.HEIF";

/**
 * Checks whether a given file or blob is a HEIF/HEIC image.
 */
export function isHeic(file: File | Blob, name?: string): boolean {
  const fileName = name || (file instanceof File ? file.name : "");
  const mime = (file.type || "").toLowerCase();
  return (
    mime === "image/heic" ||
    mime === "image/heif" ||
    mime === "image/heic-sequence" ||
    mime === "image/heif-sequence" ||
    /\.(heic|heif)$/i.test(fileName)
  );
}

/**
 * Validates file size and format before optimization.
 */
export function validateImageFile(
  file: File | Blob,
  name?: string
): { valid: boolean; error?: string } {
  const fileName = name || (file instanceof File ? file.name : "");

  // 50MB raw input safety limit
  if (file.size > 50 * 1024 * 1024) {
    return {
      valid: false,
      error: "Selected file exceeds maximum allowed size (50MB).",
    };
  }

  const mime = (file.type || "").toLowerCase();
  const isImageMime = mime.startsWith("image/");
  const isRecognizedExt = /\.(jpe?g|png|webp|gif|heic|heif|bmp|tiff?)$/i.test(
    fileName
  );

  if (!isImageMime && !isRecognizedExt) {
    return {
      valid: false,
      error: "Please select a valid image file (JPG, PNG, WebP, HEIC/HEIF).",
    };
  }

  return { valid: true };
}

/**
 * Converts a base64 / data URL string to a binary Blob.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  if (!dataUrl || !dataUrl.startsWith("data:")) {
    throw new Error("Invalid data URL provided.");
  }
  const parts = dataUrl.split(",");
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
  const binary = atob(parts[1]);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/**
 * Converts a File or Blob to a base64 data URL string (for local previews if needed).
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Converts HEIC/HEIF blob to standard JPEG blob via client-side heic2any.
 */
export async function convertHeicToJpeg(file: File | Blob): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("HEIC conversion can only be performed in browser environment.");
  }

  try {
    const heic2anyModule = await import("heic2any");
    const heic2any = heic2anyModule.default || heic2anyModule;

    const conversionResult = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });

    return Array.isArray(conversionResult)
      ? conversionResult[0]
      : conversionResult;
  } catch (err: any) {
    console.error("HEIC conversion failed:", err);
    throw new Error(
      "Could not process HEIC/HEIF photo. Please try a standard JPG/PNG photo."
    );
  }
}

function supportsWebp(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

function loadImageElement(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(source);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image into browser canvas."));
    };
    img.src = objectUrl;
  });
}

export interface OptimizeOptions {
  preset?: ImagePreset;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/webp" | "image/jpeg" | "image/png";
  fileName?: string;
}

/**
 * Optimizes an image client-side:
 * 1. Converts HEIC/HEIF to standard image format.
 * 2. Downscales dimensions to preset bounds.
 * 3. Compresses using Canvas bicubic smoothing.
 * 4. Strips EXIF/GPS metadata.
 * 5. Returns a clean binary File ready for direct S3 upload.
 */
export async function optimizeImage(
  fileOrBlob: File | Blob,
  options: OptimizeOptions = {}
): Promise<File> {
  const originalName =
    options.fileName ||
    (fileOrBlob instanceof File ? fileOrBlob.name : "photo.jpg");

  const validation = validateImageFile(fileOrBlob, originalName);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid image file.");
  }

  // 1. Convert HEIC if needed
  let workingBlob: Blob = fileOrBlob;
  if (isHeic(fileOrBlob, originalName)) {
    workingBlob = await convertHeicToJpeg(fileOrBlob);
  }

  const preset = options.preset || "general";
  const config = PRESET_CONFIGS[preset] || PRESET_CONFIGS.general;

  const maxWidth = options.maxWidth || config.maxWidth;
  const maxHeight = options.maxHeight || config.maxHeight;
  const quality = options.quality !== undefined ? options.quality : config.quality;

  let targetFormat = options.format || config.format;
  if (targetFormat === "image/webp" && !supportsWebp()) {
    targetFormat = "image/jpeg";
  }

  // 2. Load into Image element
  const img = await loadImageElement(workingBlob);
  let { width, height } = img;

  // 3. Compute scale factor (maintain aspect ratio, avoid upscaling)
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }

  // 4. Render to Canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create 2D canvas context for image optimization.");
  }

  // Transparent background for PNG, clean background for others
  if (targetFormat === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  // 5. Export compressed Blob
  const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Canvas failed to serialize optimized image."));
      },
      targetFormat,
      quality
    );
  });

  // 6. Build clean File name & extension
  const baseName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const ext =
    targetFormat === "image/webp"
      ? ".webp"
      : targetFormat === "image/png"
      ? ".png"
      : ".jpg";

  return new File([optimizedBlob], `${baseName}${ext}`, {
    type: targetFormat,
    lastModified: Date.now(),
  });
}

export interface UploadOptions extends OptimizeOptions {
  category: string;
  token?: string;
  isPublic?: boolean;
  apiBaseUrl?: string;
}

/**
 * Validates, optimizes, and uploads an image or canvas drawing directly to AWS S3.
 * Completely eliminates base64 uploads over the wire and in database records.
 *
 * @returns Public HTTPS AWS S3 URL.
 */
export async function uploadOptimizedFile(
  fileOrBlobOrDataUrl: File | Blob | string,
  options: UploadOptions
): Promise<string> {
  // If already an S3 or remote URL, return as-is
  if (typeof fileOrBlobOrDataUrl === "string") {
    const trimmed = fileOrBlobOrDataUrl.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
  }

  let sourceBlob: File | Blob;
  if (typeof fileOrBlobOrDataUrl === "string") {
    if (fileOrBlobOrDataUrl.startsWith("data:")) {
      sourceBlob = dataUrlToBlob(fileOrBlobOrDataUrl);
    } else {
      throw new Error("Unsupported image string format.");
    }
  } else {
    sourceBlob = fileOrBlobOrDataUrl;
  }

  // Optimize file (resize, HEIC convert, compress to WebP/JPEG)
  const optimizedFile = await optimizeImage(sourceBlob, options);

  // Send binary multipart/form-data directly to S3 upload endpoint
  const formData = new FormData();
  formData.append("image", optimizedFile);
  formData.append("category", options.category || "general");

  const baseUrl = options.apiBaseUrl || API_BASE_URL;
  const cleanBase = baseUrl.replace(/\/v1$/, "");
  const endpoint =
    options.isPublic || !options.token
      ? `${cleanBase}/upload/public-image`
      : `${cleanBase}/upload/image`;

  const headers: Record<string, string> = {};
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success || !json.data?.url) {
    const msg = json.error?.message || "Failed to upload optimized image to S3.";
    throw new Error(msg);
  }

  return json.data.url as string;
}
