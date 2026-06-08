import { randomUUID } from "node:crypto";

import { getPool } from "../db/pool.js";

import { getOperationalPoolForTenant } from "../db/temple-operational-pool-registry.js";

import { attachPayableInvoiceToSubmission } from "./billing.repository.js";

import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";

import { updateTempleAdminOnboardingFlags } from "../temple-ops/temple-admin-data.js";



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

  invoiceId?: string | null;

};



export type CreatePaymentSubmissionResult =

  | { ok: true; submissionId: string; invoiceId: string }

  | { ok: false; reason: "not_found" }

  | { ok: false; reason: "duplicate" }

  | { ok: false; reason: "no_payable_invoice" }

  | { ok: false; reason: "amount_mismatch" }

  | { ok: false; reason: "invoice_not_found" };



export class PostgresTemplePaymentSubmissionsRepository {

  async createPaymentSubmission(input: CreatePaymentSubmissionInput): Promise<CreatePaymentSubmissionResult> {

    const pool = getPool();

    if (!pool) {

      throw new Error("Database pool is not available");

    }



    const sessionEmail = input.sessionEmail.trim();

    const tenantId = input.templeId.trim();

    const paymentRef = input.paymentRef.trim();



    const gate = await pool.query(

      `SELECT 1 AS n FROM public.temples

       WHERE tenant_id = $1 AND ${sqlTempleMatchesSessionEmail(2)}

       LIMIT 1`,

      [tenantId, sessionEmail]

    );

    if (gate.rows.length === 0) {

      return { ok: false, reason: "not_found" };

    }



    const opsPool = await getOperationalPoolForTenant(tenantId);

    if (!opsPool) {

      return { ok: false, reason: "not_found" };

    }



    const id = randomUUID();

    const platformClient = await pool.connect();

    const opsClient = await opsPool.connect();

    let resolvedInvoiceId = "";



    try {

      await platformClient.query("BEGIN");

      await opsClient.query("BEGIN");



      try {

        try {

          await opsClient.query(

            `INSERT INTO temple_payment_submissions (

               id, payment_ref, amount_cents, currency, transferred_date, notes,

               slip_file_name, slip_mime_type,

               storage_provider, storage_object_key, storage_public_url

             ) VALUES (

               $1::uuid, $2, $3, $4, $5::date, $6,

               $7, $8,

               $9, $10, $11

             )`,

            [

              id,

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

          if (e && typeof e === "object" && "code" in e && (e as { code?: unknown }).code === "23505") {

            await opsClient.query("ROLLBACK");

            await platformClient.query("ROLLBACK");

            return { ok: false, reason: "duplicate" };

          }

          throw e;

        }



        const att = await attachPayableInvoiceToSubmission(platformClient, opsClient, {

          submissionId: id,

          tenantId,

          amountCents: input.amountCents,

          currency: input.currency,

          optionalInvoiceId: input.invoiceId,

        });



        if (!att.ok) {

          await opsClient.query("ROLLBACK");

          await platformClient.query("ROLLBACK");

          if (att.reason === "not_found") return { ok: false, reason: "invoice_not_found" };

          if (att.reason === "no_payable_invoice") return { ok: false, reason: "no_payable_invoice" };

          return { ok: false, reason: "amount_mismatch" };

        }

        resolvedInvoiceId = att.invoiceId;



        await updateTempleAdminOnboardingFlags(opsClient, {

          paymentOnboardingCompletedAt: new Date(),

          paymentSaveCardPreference: false,

        });



        await platformClient.query(

          `INSERT INTO public.temple_payment_submission_index (

             id, tenant_id, payment_ref, amount_cents, currency, transferred_date, notes,

             slip_file_name, slip_mime_type, storage_provider, storage_object_key, storage_public_url,

             status, invoice_id

           ) VALUES (

             $1::uuid, $2, $3, $4, $5, $6::date, $7,

             $8, $9, $10, $11, $12,

             'pending', $13::uuid

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

            resolvedInvoiceId,

          ]

        );



        await opsClient.query("COMMIT");

        await platformClient.query("COMMIT");

      } catch (e) {

        await opsClient.query("ROLLBACK").catch(() => undefined);

        await platformClient.query("ROLLBACK").catch(() => undefined);

        throw e;

      }



      return { ok: true, submissionId: id, invoiceId: resolvedInvoiceId };

    } catch (e) {

      console.error("[createPaymentSubmission] failed:", e);

      throw e;

    } finally {

      opsClient.release();

      platformClient.release();

    }

  }

}

