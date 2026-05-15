import { cookies } from "next/headers";
import { Pool } from "pg";
import { nextJsonError } from "@/lib/api-envelope";
import { verifyToken } from "@/lib/auth-utils";
import { getPoolConfig } from "@/lib/pg-config";

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

async function isSuperAdminEmail(email: string): Promise<boolean> {
  const result = await getPool().query<{ roles: string[] | null }>(
    `SELECT roles FROM public.users WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1`,
    [email]
  );
  const roles = result.rows[0]?.roles ?? [];
  return Array.isArray(roles) && roles.some((role) => role.trim().toLowerCase() === "super admin");
}

export async function superAdminBearerFromCookie(): Promise<{ token: string; email: string } | null> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token?.trim()) {
    return null;
  }

  const payload = await verifyToken(token);
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  const tenantId =
    typeof payload?.tenantId === "string"
      ? payload.tenantId.trim()
      : typeof payload?.tenant_id === "string"
        ? payload.tenant_id.trim()
        : "";

  if (!email || tenantId) {
    return null;
  }
  return { token, email };
}

export type SuperAdminSessionProfile = {
  email: string;
  fullName: string | null;
  roles: string[];
};

/** Current super-admin user row for dashboard UI; null if not signed in or not a super admin. */
export async function getSuperAdminSessionProfile(): Promise<SuperAdminSessionProfile | null> {
  const session = await superAdminBearerFromCookie();
  if (!session) {
    return null;
  }

  const result = await getPool().query<{ full_name: string | null; roles: string[] | null }>(
    `SELECT full_name, roles FROM public.users WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1`,
    [session.email]
  );
  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const roles = Array.isArray(row.roles) ? row.roles : [];
  const isSuper = roles.some((role) => String(role).trim().toLowerCase() === "super admin");
  if (!isSuper) {
    return null;
  }

  return {
    email: session.email,
    fullName: row.full_name?.trim() || null,
    roles,
  };
}

export async function requireSuperAdminHeaders(extra: Record<string, string> = {}) {
  const session = await superAdminBearerFromCookie();
  if (!session) {
    return {
      ok: false as const,
      response: nextJsonError(
        401,
        "UNAUTHORIZED",
        "Super-admin authentication required",
        "Sign in with a super-admin account to continue."
      ),
    };
  }

  if (!(await isSuperAdminEmail(session.email))) {
    return {
      ok: false as const,
      response: nextJsonError(
        403,
        "FORBIDDEN",
        "Super-admin role required",
        "The authenticated user does not have access to this admin API."
      ),
    };
  }

  return {
    ok: true as const,
    headers: {
      ...extra,
      Authorization: `Bearer ${session.token}`,
    },
  };
}
