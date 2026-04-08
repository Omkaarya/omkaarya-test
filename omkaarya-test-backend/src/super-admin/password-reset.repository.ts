import { createHash, randomBytes, randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { getPool } from "../db/pool.js";

const MAX_OTP_ATTEMPTS = 5;

export function hashResetToken(plain: string): string {
  return createHash("sha256").update(plain, "utf8").digest("hex");
}

export function generateFourDigitOtp(): string {
  return String(randomInt(0, 10_000)).padStart(4, "0");
}

export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * User may use forgot-password if they are linked to a temple (same cases as temple-admin access).
 */
export async function findTempleLinkedUserIdByEmail(email: string): Promise<number | null> {
  const pool = getPool();
  if (!pool) return null;
  const normalized = email.trim().toLowerCase();
  const result = await pool.query<{ id: number }>(
    `SELECT u.id
     FROM public.users u
     WHERE lower(trim(u.email)) = $1
       AND EXISTS (
         SELECT 1
         FROM public.temples t
         WHERE (u.tenant_id IS NOT NULL AND t.tenant_id = u.tenant_id)
            OR (u.tenant_id IS NULL AND t.admin_user_id = u.id)
            OR (
              u.tenant_id IS NULL
              AND t.admin_user_id IS NULL
              AND lower(trim(t.admin_email)) = lower(trim(u.email))
            )
       )
     LIMIT 1`,
    [normalized]
  );
  return result.rows[0]?.id ?? null;
}

export async function upsertOtpChallenge(
  userId: number,
  otpPlain: string,
  otpExpiresAt: Date
): Promise<void> {
  const pool = getPool();
  if (!pool) throw new Error("Database unavailable");
  const otpHash = await bcrypt.hash(otpPlain, 10);
  await pool.query(
    `INSERT INTO public.password_reset_challenges (
       user_id, otp_hash, otp_expires_at, otp_attempts,
       reset_token_hash, reset_expires_at, updated_at
     )
     VALUES ($1, $2, $3, 0, NULL, NULL, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       otp_hash = EXCLUDED.otp_hash,
       otp_expires_at = EXCLUDED.otp_expires_at,
       otp_attempts = 0,
       reset_token_hash = NULL,
       reset_expires_at = NULL,
       updated_at = NOW()`,
    [userId, otpHash, otpExpiresAt]
  );
}

type ChallengeRow = {
  otp_hash: string | null;
  otp_expires_at: Date | null;
  otp_attempts: number;
  reset_token_hash: string | null;
  reset_expires_at: Date | null;
};

export async function getChallenge(userId: number): Promise<ChallengeRow | null> {
  const pool = getPool();
  if (!pool) return null;
  const result = await pool.query<ChallengeRow>(
    `SELECT otp_hash, otp_expires_at, otp_attempts, reset_token_hash, reset_expires_at
     FROM public.password_reset_challenges
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] ?? null;
}

export async function incrementOtpAttempts(userId: number): Promise<number> {
  const pool = getPool();
  if (!pool) return MAX_OTP_ATTEMPTS;
  const result = await pool.query<{ otp_attempts: number }>(
    `UPDATE public.password_reset_challenges
     SET otp_attempts = otp_attempts + 1, updated_at = NOW()
     WHERE user_id = $1
     RETURNING otp_attempts`,
    [userId]
  );
  return result.rows[0]?.otp_attempts ?? MAX_OTP_ATTEMPTS;
}

export async function clearChallenge(userId: number): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query(`DELETE FROM public.password_reset_challenges WHERE user_id = $1`, [userId]);
}

export async function verifyOtpAndSetResetToken(
  userId: number,
  otpPlain: string,
  resetExpiresAt: Date
): Promise<{ ok: true; resetToken: string } | { ok: false; reason: "bad_otp" | "expired" | "locked" | "no_challenge" }> {
  const pool = getPool();
  if (!pool) return { ok: false, reason: "no_challenge" };

  const row = await getChallenge(userId);
  if (!row?.otp_hash || !row.otp_expires_at) {
    return { ok: false, reason: "no_challenge" };
  }
  if (row.otp_attempts >= MAX_OTP_ATTEMPTS) {
    await clearChallenge(userId);
    return { ok: false, reason: "locked" };
  }
  if (new Date(row.otp_expires_at) < new Date()) {
    await clearChallenge(userId);
    return { ok: false, reason: "expired" };
  }

  const match = await bcrypt.compare(otpPlain, row.otp_hash);
  if (!match) {
    const attempts = await incrementOtpAttempts(userId);
    if (attempts >= MAX_OTP_ATTEMPTS) {
      await clearChallenge(userId);
      return { ok: false, reason: "locked" };
    }
    return { ok: false, reason: "bad_otp" };
  }

  const resetToken = generateResetToken();
  const resetTokenHash = hashResetToken(resetToken);

  await pool.query(
    `UPDATE public.password_reset_challenges
     SET otp_hash = NULL,
         otp_expires_at = NULL,
         otp_attempts = 0,
         reset_token_hash = $2,
         reset_expires_at = $3,
         updated_at = NOW()
     WHERE user_id = $1`,
    [userId, resetTokenHash, resetExpiresAt]
  );

  return { ok: true, resetToken };
}

export async function applyPasswordFromResetToken(
  userId: number,
  resetTokenPlain: string,
  passwordBcryptHash: string
): Promise<boolean> {
  const pool = getPool();
  if (!pool) return false;

  const tokenHash = hashResetToken(resetTokenPlain);
  const result = await pool.query(
    `UPDATE public.users u
     SET password_hash = $2,
         temp_password = NULL
     FROM public.password_reset_challenges c
     WHERE u.id = $1
       AND c.user_id = u.id
       AND c.reset_token_hash = $3
       AND c.reset_expires_at IS NOT NULL
       AND c.reset_expires_at > NOW()`,
    [userId, passwordBcryptHash, tokenHash]
  );

  if (result.rowCount !== 1) {
    return false;
  }

  await clearChallenge(userId);
  return true;
}
