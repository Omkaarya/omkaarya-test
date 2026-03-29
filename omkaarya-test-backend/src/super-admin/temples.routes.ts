import { Router } from "express";
import type { TemplesService } from "./temples.service.js";
import type { CreateTemplePayload } from "./types.js";

export function createTemplesRouter(temples: TemplesService): Router {
  const r = Router();

  r.get("/temples", async (req, res) => {
    try {
      const params = new URLSearchParams();
      for (const [key, raw] of Object.entries(req.query)) {
        if (raw === undefined) continue;
        const value = Array.isArray(raw) ? raw[0] : raw;
        params.set(key, String(value));
      }
      const payload = await temples.listTemples(params);
      res.json(payload);
    } catch {
      res.status(500).json({ error: "Failed to load temples" });
    }
  });

  r.post("/temples/create", async (req, res) => {
    try {
      const body = req.body as CreateTemplePayload;
      if (!body?.temple || !body?.admin || !body?.planBilling) {
        return res.status(400).json({
          error: "Invalid payload. Temple, admin and planBilling are required.",
        });
      }
      const { templeId } = await temples.createTemple(body);
      return res.json({
        success: true,
        templeId,
        inviteQueued: true,
        message: "Temple created successfully. Invite email has been queued.",
      });
    } catch {
      return res.status(500).json({ error: "Failed to create temple." });
    }
  });

  return r;
}
