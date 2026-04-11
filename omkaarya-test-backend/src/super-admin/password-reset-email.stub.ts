/**
 * Email integration for password reset OTP. Kept as a thin wrapper so existing
 * imports remain stable.
 */
import { sendPasswordResetOtpEmail } from "../email/send-password-reset-otp.js";

const OTP_TTL_MINUTES = 15;

export async function sendPasswordResetOtp(email: string, otp: string): Promise<void> {
  const to = email.trim();
  const code = otp.trim();
  if (!to || !code) return;
  const out = await sendPasswordResetOtpEmail({ to, otp: code, expiresInMinutes: OTP_TTL_MINUTES });
  if (out.sent) return;
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[password-reset] email disabled (${out.reason}); OTP for ${to}: ${code}`);
  }
}
