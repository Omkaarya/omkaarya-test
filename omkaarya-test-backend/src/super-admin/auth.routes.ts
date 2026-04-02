import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { AuthService } from "./auth.service.js";
import { loginBodySchema } from "./validation.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
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
      const { email, tempPassword } = req.body as { email: string; tempPassword: string };

      const ok = await auth.verifyInvitationLogin(email, tempPassword);
      if (!ok) {
        throw new HttpError(401, "Invalid credentials");
      }

      res.json({ success: true, message: "Login successful" });
    })
  );

  return r;
}
