import { Router } from "express";
import { sendError, sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import { sendInvoiceOnlyEmail } from "../email/send-temple-billing.js";
import { sendTempleAdminInviteEmail } from "../email/send-temple-invite.js";
import type { TemplesService } from "./temples.service.js";
import type { CreateTemplePayload, UpdateTemplePayload } from "./types.js";
import { createTempleBodySchema, extendTrialBodySchema, tenantIdParamSchema, updateTempleBodySchema } from "./validation.js";
import { TempleEmailAlreadyInUseError } from "./temples.repository.js";
import { extendTempleTrial } from "./trial-expiry.service.js";

function asSingleParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "string" ? v : v[0];
}

function resolveAdminNotificationEmail(body: CreateTemplePayload): string {
  return body.admin.email.trim() || body.temple.email.trim();
}

function requireTenantIdParam(raw: string | string[] | undefined): string {
  const parsed = tenantIdParamSchema.safeParse(asSingleParam(raw) ?? "");
  if (!parsed.success) {
    throw new HttpError(400, "Invalid temple id", {
      code: "INVALID_ID",
      reason: "The path parameter must be a valid UUID.",
    });
  }
  return parsed.data;
}

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
      const tenantId = requireTenantIdParam(req.params.tenantId);
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

  r.delete(
    "/temples/:tenantId",
    asyncHandler(async (req, res) => {
      const tenantId = requireTenantIdParam(req.params.tenantId);
      try {
        const out = await temples.deleteTemple(tenantId);
        if (!out.ok) {
          sendError(
            res,
            404,
            "TEMPLE_NOT_FOUND",
            "Temple not found.",
            "The tenant id does not match any existing record, so the delete was skipped."
          );
          return;
        }
        sendSuccess(
          res,
          200,
          { deleted: true },
          "Temple deleted.",
          "The temple, related billing records, and operational database (when configured) were removed."
        );
      } catch (e) {
        throw new HttpError(500, "Failed to delete temple.", { cause: e });
      }
    })
  );

  r.patch(
    "/temples/:tenantId",
    validateBody(updateTempleBodySchema),
    asyncHandler(async (req, res) => {
      const tenantId = requireTenantIdParam(req.params.tenantId);
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
    "/temples/:tenantId/extend-trial",
    validateBody(extendTrialBodySchema),
    asyncHandler(async (req, res) => {
      const tenantId = requireTenantIdParam(req.params.tenantId);
      const body = req.body as { days: number };
      const out = await extendTempleTrial(tenantId, body.days);
      if (!out.ok) {
        const code =
          out.reason === "not_found"
            ? "TEMPLE_NOT_FOUND"
            : out.reason === "no_trial"
              ? "NO_TRIAL"
              : "INVALID_DAYS";
        sendError(
          res,
          out.reason === "not_found" ? 404 : 400,
          code,
          out.reason === "not_found" ? "Temple not found." : "Cannot extend trial.",
          out.reason
        );
        return;
      }
      sendSuccess(
        res,
        200,
        { trialEndsAt: out.trialEndsAt, status: out.status },
        "Trial extended",
        "The trial end date was updated."
      );
    })
  );

  r.post(
    "/temples/create",
    validateBody(createTempleBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as CreateTemplePayload;
      try {
        const { templeId, temporaryPassword, invoice, operationalDbName } = await temples.createTemple(body);
        const to = resolveAdminNotificationEmail(body);
        let inviteEmailSent: boolean | undefined;
        let invoiceEmailSent: boolean | undefined;

        if (to) {
          try {
            const out = await sendTempleAdminInviteEmail({
              to,
              templeName: body.temple.name ?? "",
              ...(typeof temporaryPassword === "string" && temporaryPassword.trim()
                ? { temporaryPassword }
                : {}),
            });
            inviteEmailSent = out.sent;
            if (!out.sent) {
              console.warn(`[temple-invite] Invite email not sent to ${to}: ${out.reason}`);
            }
          } catch (e) {
            inviteEmailSent = false;
            console.error(`[temple-invite] Failed to send invite email to ${to}`, e);
          }
        }

        if (to && invoice) {
          try {
            const out = await sendInvoiceOnlyEmail({
              to,
              templeName: body.temple.name ?? "",
              invoiceNumber: invoice.invoiceNumber,
              amountCents: invoice.amountCents,
              isTrialProforma: invoice.isTrialProforma,
              planName: invoice.planName,
              dueDate: invoice.dueDate,
              paymentReference: invoice.invoiceNumber,
            });
            invoiceEmailSent = out.sent;
          } catch (e) {
            invoiceEmailSent = false;
            console.error(`[temple-billing] Failed to email invoice to ${to}`, e);
          }
        }

        const emailedBoth = inviteEmailSent === true && invoiceEmailSent === true;
        const emailedEither = inviteEmailSent === true || invoiceEmailSent === true;
        const msg = emailedBoth
          ? "Temple created. Login details and invoice were emailed to the admin."
          : emailedEither
            ? "Temple created. At least one email was sent to the admin."
            : inviteEmailSent === false || invoiceEmailSent === false
              ? "Temple created. One or more emails could not be sent."
              : "Temple created successfully.";
        const reason = emailedBoth
          ? "A new tenant, billing invoice, and admin user (if new) were created; invite and invoice emails were sent when SMTP is configured."
          : emailedEither
            ? "Temple was created; some notification emails were sent."
            : "A new tenant (and user when applicable) was created. Email may be skipped if not configured.";
        sendSuccess(
          res,
          201,
          {
            templeId,
            operationalDbName,
            ...(invoice
              ? {
                  invoiceId: invoice.invoiceId,
                  invoiceNumber: invoice.invoiceNumber,
                }
              : {}),
            ...(inviteEmailSent !== undefined ? { inviteEmailSent } : {}),
            ...(invoiceEmailSent !== undefined ? { invoiceEmailSent } : {}),
            ...(temporaryPassword !== undefined ? { temporaryPassword } : {}),
          },
          msg,
          reason
        );
      } catch (e) {
        if (e instanceof TempleEmailAlreadyInUseError) {
          console.warn("[POST /temples/create] email conflict:", e.conflicts);
          throw new HttpError(409, "Admin email or temple email is already used by another temple.", {
            code: "EMAIL_ALREADY_IN_USE",
            reason: "Duplicate temple/admin emails are not allowed for temple creation.",
            cause: e,
          });
        }
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
