import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../middleware/async-handler.js";
import { validateBody } from "../middleware/validate.js";
import type { PasswordResetService } from "./password-reset.service.js";
import {
  passwordResetCompleteBodySchema,
  passwordResetRequestBodySchema,
  passwordResetVerifyOtpBodySchema,
} from "./validation.js";

const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const completeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export function createPasswordResetRouter(service: PasswordResetService): Router {
  const r = Router();

  r.post(
    "/password-reset/request",
    requestLimiter,
    validateBody(passwordResetRequestBodySchema),
    asyncHandler(async (req, res) => {
      const { email } = req.body as { email: string };
      const out = await service.requestOrResendOtp(email);
      res.json(out);
    })
  );

  r.post(
    "/password-reset/resend",
    requestLimiter,
    validateBody(passwordResetRequestBodySchema),
    asyncHandler(async (req, res) => {
      const { email } = req.body as { email: string };
      const out = await service.requestOrResendOtp(email);
      res.json(out);
    })
  );

  r.post(
    "/password-reset/verify-otp",
    verifyLimiter,
    validateBody(passwordResetVerifyOtpBodySchema),
    asyncHandler(async (req, res) => {
      const { email, otp } = req.body as { email: string; otp: string };
      const { resetToken } = await service.verifyOtp(email, otp);
      res.json({ success: true, resetToken });
    })
  );

  r.post(
    "/password-reset/complete",
    completeLimiter,
    validateBody(passwordResetCompleteBodySchema),
    asyncHandler(async (req, res) => {
      const { email, resetToken, newPassword } = req.body as {
        email: string;
        resetToken: string;
        newPassword: string;
        confirmNewPassword: string;
      };
      await service.complete(email, resetToken, newPassword);
      res.json({ success: true, message: "Password updated" });
    })
  );

  return r;
}
