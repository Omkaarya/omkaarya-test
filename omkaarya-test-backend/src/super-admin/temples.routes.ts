import { Router } from "express";
import { sendError, sendSuccess } from "../middleware/api-envelope.js";
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
        sendSuccess(
          res,
          200,
          payload,
          "Temples list loaded",
          "Temples are filtered, sorted, and paginated according to the query string."
        );
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
          sendError(
            res,
            404,
            "TEMPLE_NOT_FOUND",
            "Temple not found.",
            "No row exists for the given `tenantId`, or the identifier was empty."
          );
          return;
        }
        sendSuccess(
          res,
          200,
          detail,
          "Temple details loaded",
          "This payload is the full super-admin editor view for a single temple."
        );
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
          sendError(
            res,
            404,
            "TEMPLE_NOT_FOUND",
            "Temple not found.",
            "The tenant id does not match any existing record, so the update was skipped."
          );
          return;
        }
        sendSuccess(
          res,
          200,
          { updated: true },
          "Temple updated successfully.",
          "The temple row and related user profile fields were written to the database."
        );
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
        const msg =
          inviteEmailSent === true
            ? "Temple created. Invite email was sent to the admin."
            : "Temple created successfully.";
        const reason =
          inviteEmailSent === true
            ? "A new tenant row and admin user (if new) were created, and a temporary-password invite was emailed."
            : "A new tenant (and user when applicable) was created. Email may be skipped if not configured or no temp password was issued.";
        sendSuccess(
          res,
          201,
          {
            templeId,
            ...(inviteEmailSent !== undefined ? { inviteEmailSent } : {}),
            ...(temporaryPassword !== undefined ? { temporaryPassword } : {}),
          },
          msg,
          reason
        );
      } catch (e) {
        console.error("[POST /temples/create] failed:", e);
        const dev = process.env.NODE_ENV !== "production";
        const detail =
          dev && e instanceof Error
            ? e.message
            : dev && typeof e === "string"
              ? e
              : null;
        throw new HttpError(500, detail ? `Failed to create temple. ${detail}` : "Failed to create temple.", {
          cause: e,
        });
      }
    })
  );

  return r;
}
