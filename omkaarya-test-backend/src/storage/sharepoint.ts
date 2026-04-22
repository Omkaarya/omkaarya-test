type GraphDriveItem = {
  id: string;
  webUrl: string;
  name?: string;
};

function env(key: string): string {
  return (process.env[key] ?? "").trim();
}

function requiredEnv(key: string): string {
  const v = env(key);
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

async function getClientCredentialToken(): Promise<string> {
  const tenantId = requiredEnv("MS_TENANT_ID");
  const clientId = requiredEnv("MS_CLIENT_ID");
  const clientSecret = requiredEnv("MS_CLIENT_SECRET");

  const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`;
  const body = new URLSearchParams();
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  body.set("grant_type", "client_credentials");
  body.set("scope", "https://graph.microsoft.com/.default");

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok || !json || typeof json !== "object" || !("access_token" in json)) {
    const msg =
      json && typeof json === "object" && "error_description" in json
        ? String((json as { error_description?: unknown }).error_description)
        : "Failed to acquire access token.";
    throw new Error(msg);
  }
  return String((json as { access_token: string }).access_token);
}

function sanitizeFileName(raw: string): string {
  const base = raw.trim() || "payment-slip";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
  return cleaned || "payment-slip";
}

function joinPath(folder: string, fileName: string): string {
  const f = folder.replace(/^\/+|\/+$/g, "");
  const parts = [f, fileName].filter(Boolean);
  return parts.join("/");
}

function encodeDrivePath(path: string): string {
  return path
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/");
}

export async function uploadPaymentSlipToSharePoint(input: {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
}): Promise<{ driveItemId: string; webUrl: string }> {
  const siteId = requiredEnv("SP_SITE_ID");
  const driveId = requiredEnv("SP_DRIVE_ID");
  const folder = env("SP_UPLOAD_FOLDER") || "Payments/TempleOnboarding";

  const fileName = sanitizeFileName(input.fileName);
  const itemPath = encodeDrivePath(joinPath(folder, fileName));

  const token = await getClientCredentialToken();

  const url = `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}/drives/${encodeURIComponent(
    driveId
  )}/root:/${itemPath}:/content`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": input.mimeType,
    },
    // Node fetch accepts Uint8Array/Buffer, but TS lib config here may not model BufferSource.
    body: input.bytes as any,
  });

  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const msg =
      json && typeof json === "object" && "error" in json
        ? JSON.stringify((json as { error?: unknown }).error)
        : `SharePoint upload failed with status ${res.status}`;
    throw new Error(msg);
  }

  const item = json as GraphDriveItem;
  if (!item?.id || !item?.webUrl) {
    throw new Error("SharePoint upload succeeded but response was missing id/webUrl.");
  }
  return { driveItemId: item.id, webUrl: item.webUrl };
}

