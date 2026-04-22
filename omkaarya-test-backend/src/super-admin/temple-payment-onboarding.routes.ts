import { Router } from "express";
import rateLimit from "express-rate-limit";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresTemplePaymentOnboardingRepository } from "./temple-payment-onboarding.repository.js";
import { templePaymentOnboardingBodySchema } from "./validation.js";

const paymentOnboardingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

export function createTemplePaymentOnboardingRouter(
  payment: PostgresTemplePaymentOnboardingRepository
): Router {
  const r = Router();

  r.post(
    "/temple-admin/payment-onboarding",
    paymentOnboardingLimiter,
    validateBody(templePaymentOnboardingBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as {
        sessionEmail: string;
        templeId: string;
        saveCardPreferred: boolean;
      };

      const result = await payment.completePaymentOnboarding({
        sessionEmail: body.sessionEmail,
        templeId: body.templeId,
        saveCardPreferred: body.saveCardPreferred,
      });

      if (!result.ok) {
        throw new HttpError(404, "Temple not found for this session or temple id.", {
          code: "TEMPLE_NOT_FOUND",
          reason: "The session could not be matched to a temple for the id you sent.",
        });
      }

      sendSuccess(
        res,
        200,
        { saved: true },
        "Payment onboarding step recorded",
        "The server stored the cardless onboarding preference; no real payment is processed here."
      );
    })
  );

  return r;
}
