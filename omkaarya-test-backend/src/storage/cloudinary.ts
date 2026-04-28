import { v2 as cloudinary } from "cloudinary";

function env(key: string): string {
  return (process.env[key] ?? "").trim();
}

function requiredEnv(key: string): string {
  const v = env(key);
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

function configureCloudinaryOnce(): void {
  // cloudinary keeps config globally; calling repeatedly is fine, but keep it centralized.
  cloudinary.config({
    cloud_name: requiredEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requiredEnv("CLOUDINARY_API_KEY"),
    api_secret: requiredEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });
}

function sanitizePublicIdBase(raw: string): string {
  const base = raw.trim() || "payment-slip";
  return base
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Browser FileReader `readAsDataURL` output: `data:<mime>;base64,<data>` */
export function parseBase64ImageDataUrl(dataUrl: string): { mimeType: string; bytes: Uint8Array } {
  const trimmed = dataUrl.trim();
  const match = /^data:([^;,]+);base64,(.+)$/i.exec(trimmed);
  if (!match) {
    throw new Error("Expected a base64 data URL (data:*/*;base64,...).");
  }
  const mimeType = match[1]!.split(";")[0]!.trim();
  const b64 = match[2]!;
  const buf = Buffer.from(b64, "base64");
  return { mimeType, bytes: new Uint8Array(buf) };
}

const BRANDING_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

export type BrandingImageKind = "temple-logo" | "admin-profile";

/**
 * If `data:` base64, uploads to Cloudinary and returns `secureUrl`.
 * If `http(s)`, returns the string unchanged.
 * Empty/null → null.
 */
export async function storeBrandingImageIfNeeded(
  raw: string | null | undefined,
  kind: BrandingImageKind,
  fileNameHint: string
): Promise<string | null> {
  if (raw == null) return null;
  const t = String(raw).trim();
  if (!t) return null;
  if (t.startsWith("data:")) {
    return (await uploadBrandingImageDataUrlToCloudinary({ dataUrl: t, fileNameHint, kind })).secureUrl;
  }
  if (/^https?:\/\//i.test(t)) return t;
  // Legacy or unexpected: keep as-is (e.g. old data URLs in DB if mis-detected)
  return t;
}

function brandingFolderForKind(kind: BrandingImageKind): string {
  if (kind === "temple-logo") {
    return env("CLOUDINARY_BRANDING_TEMPLE_LOGO_FOLDER") || "omkaarya/branding/temple-logo";
  }
  return env("CLOUDINARY_BRANDING_ADMIN_PROFILE_FOLDER") || "omkaarya/branding/admin-profile";
}

/**
 * Upload a logo / profile image provided as a base64 data URL (from JSON bodies).
 * Validates image MIME type before upload.
 */
export async function uploadBrandingImageDataUrlToCloudinary(input: {
  dataUrl: string;
  fileNameHint: string;
  kind: BrandingImageKind;
}): Promise<{ publicId: string; secureUrl: string }> {
  const { mimeType, bytes } = parseBase64ImageDataUrl(input.dataUrl);
  const baseMime = mimeType.toLowerCase();
  if (!BRANDING_IMAGE_MIMES.has(baseMime)) {
    throw new Error(`Unsupported branding image type: ${baseMime || "unknown"}`);
  }
  return uploadBytesToCloudinaryFolder({
    fileName: input.fileNameHint,
    mimeType: baseMime,
    bytes,
    folder: brandingFolderForKind(input.kind),
    resourceType: "image",
  });
}

async function uploadBytesToCloudinaryFolder(input: {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
  folder: string;
  resourceType: "image" | "auto";
}): Promise<{ publicId: string; secureUrl: string }> {
  configureCloudinaryOnce();
  const publicIdBase = sanitizePublicIdBase(input.fileName);
  const b64 = Buffer.from(input.bytes).toString("base64");
  const dataUri = `data:${input.mimeType || "application/octet-stream"};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: input.folder,
    public_id: publicIdBase,
    resource_type: input.resourceType,
    overwrite: false,
    unique_filename: true,
  });

  const publicId = String(result.public_id || "");
  const secureUrl = String(result.secure_url || "");
  if (!publicId || !secureUrl) {
    throw new Error("Cloudinary upload succeeded but response was missing public_id/secure_url.");
  }
  return { publicId, secureUrl };
}

export async function uploadPaymentSlipToCloudinary(input: {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
}): Promise<{ publicId: string; secureUrl: string }> {
  const folder = env("CLOUDINARY_FOLDER") || "omkaarya/payments/temple-onboarding";
  return uploadBytesToCloudinaryFolder({
    fileName: input.fileName,
    mimeType: input.mimeType,
    bytes: input.bytes,
    folder,
    resourceType: "auto",
  });
}

