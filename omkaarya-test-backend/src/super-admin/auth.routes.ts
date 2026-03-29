import { Router } from "express";
import type { AuthService } from "./auth.service.js";

export function createAuthRouter(auth: AuthService): Router {
  const r = Router();

  r.post("/login", async (req, res) => {
    try {
      const { email, tempPassword } = req.body as { email?: string; tempPassword?: string };
      if (!email || !tempPassword) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const ok = await auth.verifyInvitationLogin(email, tempPassword);
      if (!ok) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      return res.json({ success: true, message: "Login successful" });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return r;
}
