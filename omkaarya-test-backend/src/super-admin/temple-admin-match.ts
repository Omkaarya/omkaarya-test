/**
 * SQL fragment: temple row is accessible to the user identified by session email.
 * Prefers users.tenant_id; falls back to temples.admin_user_id; then legacy admin_email match.
 */
export function sqlTempleMatchesSessionEmail(emailParam: number): string {
  return `EXISTS (
    SELECT 1 FROM public.users u
    WHERE lower(trim(u.email)) = lower(trim($${emailParam}))
      AND (
        (u.tenant_id IS NOT NULL AND temples.tenant_id = u.tenant_id)
        OR (u.tenant_id IS NULL AND temples.admin_user_id = u.id)
        OR (
          u.tenant_id IS NULL
          AND temples.admin_user_id IS NULL
          AND lower(trim(temples.admin_email)) = lower(trim(u.email))
        )
      )
  )`;
}
