import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { AuthService } from "./auth.service.js";
import { loginBodySchema, setPasswordBodySchema } from "./validation.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const setPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export function createAuthRouter(auth: AuthService): Router {
  const r = Router();

  r.post(
    "/login",
    loginLimiter,
    validateBody(loginBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as { email: string; password?: string; tempPassword?: string };
      const password = (body.password ?? body.tempPassword ?? "").trim();
      const result = await auth.login(body.email, password);
      if (!result.ok) {
        throw new HttpError(401, "Invalid credentials");
      }

      res.json({
        success: true,
        firstLogin: result.firstLogin,
        message: "Login successful",
      });
    })
  );

  r.post(
    "/set-password",
    setPasswordLimiter,
    validateBody(setPasswordBodySchema),
    asyncHandler(async (req, res) => {
      const { email, tempPassword, newPassword } = req.body as {
        email: string;
        tempPassword: string;
        newPassword: string;
      };
      const ok = await auth.setPermanentPassword(email, tempPassword, newPassword);
      if (!ok) {
        throw new HttpError(400, "Could not set password. Check your email and temporary password.");
      }
      res.json({ success: true, message: "Password updated" });
    })
  );

  return r;
}
