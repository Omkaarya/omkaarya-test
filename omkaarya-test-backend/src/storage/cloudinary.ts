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

export async function uploadPaymentSlipToCloudinary(input: {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
}): Promise<{ publicId: string; secureUrl: string }> {
  configureCloudinaryOnce();

  const folder = env("CLOUDINARY_FOLDER") || "omkaarya/payments/temple-onboarding";
  const publicIdBase = sanitizePublicIdBase(input.fileName);

  // Cloudinary upload API wants a data URI or remote URL; easiest is data URI for in-memory bytes.
  const b64 = Buffer.from(input.bytes).toString("base64");
  const dataUri = `data:${input.mimeType || "application/octet-stream"};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: publicIdBase,
    resource_type: "auto",
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

