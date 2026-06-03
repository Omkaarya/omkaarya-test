import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { sendSuccess } from "../middleware/api-envelope.js";
import { HttpError } from "../middleware/http-error.js";
import { expireTrials } from "./trial-expiry.service.js";

function assertCronSecret(req: { header: (name: string) => string | undefined }): void {
  const expected = (process.env.CRON_SECRET ?? "").trim();
  if (!expected) {
    throw new HttpError(503, "Cron not configured.", {
      code: "CRON_NOT_CONFIGURED",
      reason: "Set CRON_SECRET on the server and pass it as x-cron-secret.",
    });
  }
  const got = (req.header("x-cron-secret") ?? "").trim();
  if (!got || got !== expected) {
    throw new HttpError(403, "Forbidden.", {
      code: "FORBIDDEN",
      reason: "Invalid or missing x-cron-secret header.",
    });
  }
}

export function createInternalCronRouter(): Router {
  const r = Router();

  r.post(
    "/internal/cron/expire-trials",
    asyncHandler(async (req, res) => {
      assertCronSecret(req);
      const result = await expireTrials();
      sendSuccess(
        res,
        200,
        result,
        "Trial expiry job completed",
        "Processed temples whose trial_ends_at has passed."
      );
    })
  );

  return r;
}
