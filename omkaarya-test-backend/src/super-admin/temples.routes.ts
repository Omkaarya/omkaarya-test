import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import { sendTempleAdminInviteEmail } from "../email/send-temple-invite.js";
import type { TemplesService } from "./temples.service.js";
import type { CreateTemplePayload, UpdateTemplePayload } from "./types.js";
import { createTempleBodySchema, updateTempleBodySchema } from "./validation.js";

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

  r.get(
    "/temples/:tenantId",
    asyncHandler(async (req, res) => {
      const tenantId = typeof req.params.tenantId === "string" ? req.params.tenantId : "";
      try {
        const detail = await temples.getTempleForEdit(tenantId);
        if (!detail) {
          res.status(404).json({ error: "Temple not found." });
          return;
        }
        res.json(detail);
      } catch (e) {
        throw new HttpError(500, "Failed to load temple.", { cause: e });
      }
    })
  );

  r.patch(
    "/temples/:tenantId",
    validateBody(updateTempleBodySchema),
    asyncHandler(async (req, res) => {
      const tenantId = typeof req.params.tenantId === "string" ? req.params.tenantId : "";
      const body = req.body as UpdateTemplePayload;
      try {
        const out = await temples.updateTemple(tenantId, body);
        if (!out.ok) {
          res.status(404).json({ error: "Temple not found." });
          return;
        }
        res.json({ success: true, message: "Temple updated successfully." });
      } catch (e) {
        throw new HttpError(500, "Failed to update temple.", { cause: e });
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
