/** Edge-safe temple-admin JWT session helpers (no Node/pg imports). */

export function tenantIdFromPayload(payload: Record<string, unknown> | null): string {
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

/** Whether the JWT payload looks like a temple-admin session (used by edge middleware). */
export function isTempleScopedAuthPayload(payload: Record<string, unknown> | null): boolean {
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  const tenantId = tenantIdFromPayload(payload);
  return Boolean(email && tenantId);
}
