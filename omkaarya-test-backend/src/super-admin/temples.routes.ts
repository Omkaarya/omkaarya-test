import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import { sendTempleAdminInviteEmail } from "../email/send-temple-invite.js";
import type { TemplesService } from "./temples.service.js";
import type { CreateTemplePayload } from "./types.js";
import { createTempleBodySchema } from "./validation.js";

export function createTemplesRouter(temples: TemplesService): Router {
  const r = Router();

  r.get(
    "/temples",
    asyncHandler(async (req, res) => {
      try {
        const params = new URLSearchParams();
        for (const [key, raw] of Object.entries(req.query)) {
          if (raw === undefined) continue;
          const value = Array.isArray(raw) ? raw[0] : raw;
          params.set(key, String(value));
        }
        const payload = await temples.listTemples(params);
        res.json(payload);
      } catch (e) {
        throw new HttpError(500, "Failed to load temples", { cause: e });
      }
    })
  );

  r.post(
    "/temples/create",
    validateBody(createTempleBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as CreateTemplePayload;
      try {
        const { templeId, temporaryPassword } = await temples.createTemple(body);
        let inviteEmailSent: boolean | undefined = undefined;
        if (typeof temporaryPassword === "string" && temporaryPassword.trim()) {
          try {
            const out = await sendTempleAdminInviteEmail({
              to: body.admin.email.trim(),
              templeName: body.temple.name ?? "",
              temporaryPassword,
            });
            inviteEmailSent = out.sent;
          } catch (e) {
            inviteEmailSent = false;
            console.error(`[temple-invite] Failed to send invite email to ${body.admin.email.trim()}`, e);
          }
        }
        res.json({
          success: true,
          templeId,
          ...(inviteEmailSent !== undefined ? { inviteEmailSent } : {}),
          message:
            inviteEmailSent === true
              ? "Temple created successfully. An invite email has been sent to the temple admin."
              : "Temple created successfully.",
          ...(temporaryPassword !== undefined ? { temporaryPassword } : {}),
        });
      } catch (e) {
        throw new HttpError(500, "Failed to create temple.", { cause: e });
      }
    })
  );

  return r;
}
