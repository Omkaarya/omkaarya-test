import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { uploadPaymentSlipToCloudinary } from "../storage/cloudinary.js";
import type { PostgresTemplePaymentSubmissionsRepository } from "./temple-payment-submissions.repository.js";
import { templePaymentSubmissionFieldsSchema } from "./validation.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export function createTemplePaymentSubmissionsRouter(repo: PostgresTemplePaymentSubmissionsRepository): Router {
  const r = Router();

  r.post(
    "/temple-admin/payment-submissions",
    limiter,
    upload.single("slip"),
    asyncHandler(async (req, res) => {
      const parsed = templePaymentSubmissionFieldsSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(400, "Invalid payment submission.", {
          code: "VALIDATION_ERROR",
          reason: parsed.error.issues.map((i) => i.message).join(" "),
        });
      }

      const file = req.file;
      if (!file) {
        throw new HttpError(400, "Bank transfer slip is required.", {
          code: "SLIP_REQUIRED",
          reason: "Upload the payment slip file (pdf/png/jpg).",
        });
      }

      const mime = (file.mimetype ?? "").trim();
      const allowed = new Set([
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/svg+xml",
      ]);
      if (!allowed.has(mime)) {
        throw new HttpError(400, "Unsupported slip file type.", {
          code: "UNSUPPORTED_FILE_TYPE",
          reason: `MIME type ${mime || "unknown"} is not allowed.`,
        });
      }

      const { publicId, secureUrl } = await uploadPaymentSlipToCloudinary({
        fileName: file.originalname || "payment-slip",
        mimeType: mime || "application/octet-stream",
        bytes: file.buffer,
      });

      const result = await repo.createPaymentSubmission({
        sessionEmail: parsed.data.sessionEmail,
        templeId: parsed.data.templeId,
        paymentRef: parsed.data.paymentRef,
        amountCents: parsed.data.amountCents,
        currency: parsed.data.currency,
        transferredDate: parsed.data.transferredDate,
        notes: parsed.data.notes,
        slipFileName: file.originalname || "payment-slip",
        slipMimeType: mime || "application/octet-stream",
        storageProvider: "cloudinary",
        storageObjectKey: publicId,
        storagePublicUrl: secureUrl,
      });

      if (!result.ok) {
        if (result.reason === "not_found") {
          throw new HttpError(404, "Temple not found for this session or temple id.", {
            code: "TEMPLE_NOT_FOUND",
            reason: "The session could not be matched to a temple for the id you sent.",
          });
        }
        if (result.reason === "duplicate") {
          throw new HttpError(409, "Payment submission already exists for this reference.", {
            code: "DUPLICATE_SUBMISSION",
            reason: "A submission with this payment reference was already recorded.",
          });
        }
      }

      sendSuccess(
        res,
        201,
        { saved: true, submissionId: result.ok ? result.submissionId : undefined, slipUrl: secureUrl },
        "Payment submission recorded",
        "The server stored the payment details and uploaded the slip to Cloudinary."
      );
    })
  );

  return r;
}

