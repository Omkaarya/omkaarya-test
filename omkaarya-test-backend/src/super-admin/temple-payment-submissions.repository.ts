import { randomUUID } from "node:crypto";
import { getPool } from "../db/pool.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";

export type CreatePaymentSubmissionInput = {
  sessionEmail: string;
  templeId: string;
  paymentRef: string;
  amountCents: number;
  currency: string;
  transferredDate: string; // YYYY-MM-DD
  notes?: string;
  slipFileName: string;
  slipMimeType: string;
  storageProvider: "sharepoint" | "cloudinary";
  storageObjectKey: string;
  storagePublicUrl: string;
};

export type CreatePaymentSubmissionResult =
  | { ok: true; submissionId: string }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "duplicate" };

export class PostgresTemplePaymentSubmissionsRepository {
  async createPaymentSubmission(input: CreatePaymentSubmissionInput): Promise<CreatePaymentSubmissionResult> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }

    const sessionEmail = input.sessionEmail.trim();
    const tenantId = input.templeId.trim();
    const paymentRef = input.paymentRef.trim();

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      try {
        const id = randomUUID();

        try {
          await client.query(
            `INSERT INTO public.temple_payment_submissions (
               id, tenant_id, payment_ref, amount_cents, currency, transferred_date, notes,
               slip_file_name, slip_mime_type,
               storage_provider, storage_object_key, storage_public_url
             ) VALUES (
               $1, $2, $3, $4, $5, $6::date, $7,
               $8, $9,
               $10, $11, $12
             )`,
            [
              id,
              tenantId,
              paymentRef,
              input.amountCents,
              input.currency.trim(),
              input.transferredDate,
              input.notes?.trim() || null,
              input.slipFileName,
              input.slipMimeType,
              input.storageProvider,
              input.storageObjectKey,
              input.storagePublicUrl,
            ]
          );
        } catch (e) {
          // Unique constraint violation => duplicate submission for same ref
          if (e && typeof e === "object" && "code" in e && (e as { code?: unknown }).code === "23505") {
            await client.query("ROLLBACK");
            return { ok: false, reason: "duplicate" };
          }
          throw e;
        }

        const updated = await client.query(
          `UPDATE public.temples
           SET payment_onboarding_completed_at = NOW(),
               payment_save_card_preference = FALSE
           WHERE tenant_id = $1 AND ${sqlTempleMatchesSessionEmail(2)}`,
          [tenantId, sessionEmail]
        );
        if (updated.rowCount === 0) {
          await client.query("ROLLBACK");
          return { ok: false, reason: "not_found" };
        }

        await client.query("COMMIT");
        return { ok: true, submissionId: id };
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    } finally {
      client.release();
    }
  }
}

