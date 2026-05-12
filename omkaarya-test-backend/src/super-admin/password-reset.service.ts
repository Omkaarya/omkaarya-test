import { HttpError } from "../middleware/http-error.js";
import { syncTempleAuthMirrorFromPlatformUserId } from "../temple-ops/sync-auth-mirror.js";
import { sendPasswordResetOtp } from "./password-reset-email.stub.js";
import { hashPasswordCredential } from "./password-credentials.js";
import {
  applyPasswordFromResetToken,
  findTempleLinkedUserIdByEmail,
  generateFourDigitOtp,
  upsertOtpChallenge,
  verifyOtpAndSetResetToken,
} from "./password-reset.repository.js";

const UNIFORM_REQUEST_MESSAGE =
  "If an account exists for this email, a verification code has been sent.";

const OTP_TTL_MS = 15 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

export class PasswordResetService {
  async requestOrResendOtp(email: string): Promise<{ success: true; message: string }> {
    const userId = await findTempleLinkedUserIdByEmail(email);
    if (userId != null) {
      const otp = generateFourDigitOtp();
      const expiresAt = new Date(Date.now() + OTP_TTL_MS);
      await upsertOtpChallenge(userId, otp, expiresAt);
      await sendPasswordResetOtp(email.trim(), otp);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[password-reset] OTP for ${email.trim()}: ${otp}`);
      }
    }
    return { success: true, message: UNIFORM_REQUEST_MESSAGE };
  }

  async verifyOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    const userId = await findTempleLinkedUserIdByEmail(email);
    if (userId == null) {
      throw new HttpError(401, "Invalid or expired verification code.", {
        code: "INVALID_OTP",
        reason: "No temple-linked user exists for this email, or the challenge cannot be used.",
      });
    }
    const resetExpiresAt = new Date(Date.now() + RESET_TTL_MS);
    const result = await verifyOtpAndSetResetToken(userId, otp.trim(), resetExpiresAt);
    if (!result.ok) {
      throw new HttpError(401, "Invalid or expired verification code.", {
        code: "INVALID_OTP",
        reason: "The code was wrong, expired, or did not match the latest challenge for this user.",
      });
    }
    return { resetToken: result.resetToken };
  }

  async complete(email: string, resetToken: string, newPassword: string): Promise<void> {
    const userId = await findTempleLinkedUserIdByEmail(email);
    if (userId == null) {
      throw new HttpError(400, "Could not reset password. Request a new code.", {
        code: "RESET_FAILED",
        reason: "The email is not linked to a user eligible for this reset flow.",
      });
    }
    const hash = await hashPasswordCredential(newPassword);
    const ok = await applyPasswordFromResetToken(userId, resetToken.trim(), hash);
    if (!ok) {
      throw new HttpError(400, "Could not reset password. Request a new code.", {
        code: "RESET_TOKEN_INVALID",
        reason: "The reset token is missing, expired, or was already used.",
      });
    }

    try {
      await syncTempleAuthMirrorFromPlatformUserId(userId);
    } catch (e) {
      if (process.env.TEMPLE_AUTH_SYNC_REQUIRED?.trim() === "1") {
        const reason = e instanceof Error ? e.message : String(e);
        throw new HttpError(500, "Password reset succeeded but temple credential mirror failed.", {
          code: "TEMPLE_MIRROR_SYNC_FAILED",
          reason,
        });
      }
      console.warn("[password-reset] temple auth mirror sync failed:", e);
    }
  }
}
