import { cookies } from "next/headers";
import { Pool } from "pg";
import { nextJsonError } from "@/lib/api-envelope";
import { verifyToken } from "@/lib/auth-utils";
import { getPoolConfig } from "@/lib/pg-config";
import { isPlatformSuperAdminEmail } from "@/lib/super-admin-auth";

let pool: Pool | null = null;

function getPool(): Pool {
  const config = getPoolConfig();
  if (!config) {
    throw new Error("Database not configured. Set DATABASE_URL or DB env vars.");
  }
  if (!pool) {
    pool = new Pool(config);
  }
  return pool;
}

function tenantIdFromPayload(payload: Record<string, unknown> | null): string {
  if (!payload) return "";
  if (typeof payload.tenantId === "string") return payload.tenantId.trim();
  if (payload.tenant_id != null) return String(payload.tenant_id).trim();
  return "";
}

export type TempleAdminSession = {
  token: string;
  email: string;
  tenantId: string;
  userId?: string;
};

/** Reads `auth_token`, requires email + tenantId, and rejects platform-only super-admin sessions. */
export async function templeAdminBearerFromCookie(): Promise<TempleAdminSession | null> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token?.trim()) {
    return null;
  }

  const payload = await verifyToken(token);
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  const tenantId = tenantIdFromPayload(payload as Record<string, unknown> | null);
  const userId =
    typeof payload?.userId === "string"
      ? payload.userId.trim()
      : typeof payload?.userId === "number" && Number.isFinite(payload.userId)
        ? String(payload.userId)
        : undefined;

  if (!email || !tenantId) {
    return null;
  }

  return { token, email, tenantId, userId };
}

export type TempleAdminSessionProfile = {
  email: string;
  fullName: string | null;
  tenantId: string;
};

/** Current temple-admin user; null if not signed in or session is not tenant-scoped. */
export async function getTempleAdminSessionProfile(): Promise<TempleAdminSessionProfile | null> {
  const session = await templeAdminBearerFromCookie();
  if (!session) {
    return null;
  }

  const config = getPoolConfig();
  if (!config) {
    // Without DB, trust JWT tenant claim (Express will re-validate operational APIs).
    return { email: session.email, fullName: null, tenantId: session.tenantId };
  }

  try {
    if (await isPlatformSuperAdminEmail(session.email)) {
      return null;
    }
  } catch {
    /* DB unavailable — fall through to tenant row check */
  }

  const result = await getPool().query<{ full_name: string | null; tenant_id: string | null }>(
    `SELECT full_name, tenant_id FROM public.users WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1`,
    [session.email]
  );
  const row = result.rows[0];
  if (!row?.tenant_id?.trim()) {
    return null;
  }
  if (row.tenant_id.trim() !== session.tenantId) {
    return null;
  }

  return {
    email: session.email,
    fullName: row.full_name?.trim() || null,
    tenantId: session.tenantId,
  };
}

export async function requireTempleAdminHeaders(extra: Record<string, string> = {}) {
  const session = await templeAdminBearerFromCookie();
  if (!session) {
    return {
      ok: false as const,
      response: nextJsonError(
        401,
        "UNAUTHORIZED",
        "Temple-admin authentication required",
        "Sign in with a temple administrator account to continue."
      ),
    };
  }

  if (getPoolConfig()) {
    const profile = await getTempleAdminSessionProfile();
    if (!profile) {
      return {
        ok: false as const,
        response: nextJsonError(
          403,
          "FORBIDDEN",
          "Temple-admin access required",
          "The authenticated user does not have access to this temple admin area."
        ),
      };
    }
  }

  return {
    ok: true as const,
    session,
    headers: {
      ...extra,
      Authorization: `Bearer ${session.token}`,
    },
  };
}

/** Whether the JWT cookie looks like a temple-admin session (used by edge middleware). */
export function isTempleScopedAuthPayload(payload: Record<string, unknown> | null): boolean {
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  const tenantId = tenantIdFromPayload(payload);
  return Boolean(email && tenantId);
}
