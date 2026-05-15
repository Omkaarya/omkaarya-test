import { cookies } from "next/headers";
import { Pool } from "pg";
import { nextJsonError } from "@/lib/api-envelope";
import { verifyToken } from "@/lib/auth-utils";
import { getPoolConfig } from "@/lib/pg-config";

let pool: Pool | null = null;

function normalizeRolesFromDb(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((r) => String(r).trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return [];
    if (s.startsWith("[") || s.startsWith("{")) {
      try {
        const parsed = JSON.parse(s) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.map((r) => String(r).trim()).filter(Boolean);
        }
      } catch {
        /* fall through */
      }
    }
    if (s.includes(",")) {
      return s.split(",").map((x) => x.trim()).filter(Boolean);
    }
    return [s];
  }
  return [];
}

function hasSuperAdminRole(roles: string[]): boolean {
  return roles.some((role) => {
    const n = String(role).trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ");
    return n === "super admin" || n.replace(/\s/g, "") === "superadmin";
  });
}

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

/** True when `public.users` has a super-admin role for this email (Express platform JWT should omit tenantId). */
export async function isPlatformSuperAdminEmail(email: string): Promise<boolean> {
  const result = await getPool().query<{ roles: unknown }>(
    `SELECT roles FROM public.users WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1`,
    [email]
  );
  const roles = normalizeRolesFromDb(result.rows[0]?.roles);
  return hasSuperAdminRole(roles);
}

export async function superAdminBearerFromCookie(): Promise<{ token: string; email: string } | null> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token?.trim()) {
    return null;
  }

  const payload = await verifyToken(token);
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";

  // Do not require absence of tenantId: backend login often attaches a default
  // tenant for platform users; super-admin access is enforced via roles below.
  if (!email) {
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

  const result = await getPool().query<{ full_name: string | null; roles: unknown }>(
    `SELECT full_name, roles FROM public.users WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1`,
    [session.email]
  );
  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const roles = normalizeRolesFromDb(row.roles);
  if (!hasSuperAdminRole(roles)) {
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

  // When Next has no DATABASE_URL (typical on Vercel), role checks run on the Express API.
  if (getPoolConfig()) {
    if (!(await isPlatformSuperAdminEmail(session.email))) {
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
  }

  return {
    ok: true as const,
    headers: {
      ...extra,
      Authorization: `Bearer ${session.token}`,
    },
  };
}
