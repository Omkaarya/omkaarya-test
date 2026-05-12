/**
 * Copies temple-admin profile columns from `public.temples` and payment submissions from
 * `public.temple_payment_submissions` into each tenant's operational database.
 *
 * Run after platform migration 024 and **before** 025 (drop legacy submissions) / 026 (drop temple columns):
 *   npm run migrate:temple-admin-data-to-ops
 *
 * Requires TEMPLE_OPS_DB_HOST, TEMPLE_OPS_DB_USER, etc. (same as temple-ops:bootstrap).
 */
import "../src/load-env.js";
import pg from "pg";
import { getPoolConfig } from "../src/db/config.js";
import { getOperationalPoolForTenant } from "../src/db/temple-operational-pool-registry.js";
import { ensureTempleOpsDatabaseMigrated } from "../src/temple-ops/ensure-temple-ops-database.js";
import { upsertTempleAdminData } from "../src/temple-ops/temple-admin-data.js";

async function tableExists(client: pg.Client, name: string): Promise<boolean> {
  const r = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [name]
  );
  return r.rows[0]?.exists === true;
}

async function main(): Promise<void> {
  const cfg = getPoolConfig();
  if (!cfg) {
    console.error("Set DATABASE_URL or DB_* for the platform database.");
    process.exit(1);
  }

  const platform = new pg.Client(cfg);
  await platform.connect();

  try {
    const { rows: temples } = await platform.query(`SELECT tenant_id FROM public.temples ORDER BY tenant_id::int ASC`);

    for (const t of temples) {
      const tenantId = String((t as { tenant_id: string }).tenant_id);
      const ensured = await ensureTempleOpsDatabaseMigrated(tenantId);
      if (!ensured.ok) {
        console.warn(`[migrate] skip tenant ${tenantId}: could not ensure ops DB (${ensured.reason})`);
        continue;
      }

      let detail: { rows: Record<string, unknown>[] };
      try {
        detail = await platform.query<Record<string, unknown>>(
          `SELECT
             contact_phone, contact_whatsapp, fax, website_url, established_year, full_address, logo_data_url,
             tradition, charity_registered, charity_registration_number,
             primary_deity_id, sub_deity_ids, deity_custom_note, deity_prefer_custom_later
           FROM public.temples WHERE tenant_id = $1 LIMIT 1`,
          [tenantId]
        );
      } catch (e) {
        console.warn(
          `[migrate] could not read wide temple columns for ${tenantId} (run this script before migration 026):`,
          e
        );
        continue;
      }
      const row = detail.rows[0];
      if (!row) continue;

      const opsPool = await getOperationalPoolForTenant(tenantId);
      if (!opsPool) {
        console.warn(`[migrate] no ops pool for ${tenantId}`);
        continue;
      }

      const oc = await opsPool.connect();
      try {
        await oc.query(`INSERT INTO temple_admin_data (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
        await upsertTempleAdminData(oc, {
          contactPhone: row.contact_phone ?? {},
          contactWhatsapp: row.contact_whatsapp ?? {},
          fax: row.fax ?? {},
          websiteUrl: row.website_url != null ? String(row.website_url) : null,
          establishedYear: row.established_year != null ? String(row.established_year) : null,
          fullAddress: row.full_address ?? {},
          logoDataUrl: row.logo_data_url != null ? String(row.logo_data_url) : null,
          tradition: row.tradition != null ? String(row.tradition) : null,
          charityRegistered: Boolean(row.charity_registered),
          charityRegistrationNumber:
            row.charity_registration_number != null ? String(row.charity_registration_number) : null,
          primaryDeityId: row.primary_deity_id != null ? String(row.primary_deity_id) : null,
          subDeityIds: Array.isArray(row.sub_deity_ids) ? (row.sub_deity_ids as string[]) : [],
          deityCustomNote: row.deity_custom_note != null ? String(row.deity_custom_note) : null,
          deityPreferCustomLater:
            row.deity_prefer_custom_later === null || row.deity_prefer_custom_later === undefined
              ? null
              : Boolean(row.deity_prefer_custom_later),
        });
        console.log(`[migrate] temple_admin_data upserted for ${tenantId}`);
      } finally {
        oc.release();
      }
    }

    if (await tableExists(platform, "temple_payment_submissions")) {
      const { rows: subs } = await platform.query<{
        id: string;
        tenant_id: string;
        payment_ref: string;
        amount_cents: number;
        currency: string;
        transferred_date: string;
        notes: string | null;
        slip_file_name: string;
        slip_mime_type: string;
        storage_provider: string;
        storage_object_key: string;
        storage_public_url: string;
        status: string;
        invoice_id: string | null;
        created_at: string;
      }>(
        `SELECT id, tenant_id, payment_ref, amount_cents, currency, transferred_date, notes,
                slip_file_name, slip_mime_type,
                COALESCE(storage_provider, 'bunny') AS storage_provider,
                storage_object_key, storage_public_url,
                status, invoice_id, created_at
         FROM public.temple_payment_submissions`
      );

      for (const s of subs) {
        const ensured = await ensureTempleOpsDatabaseMigrated(s.tenant_id);
        if (!ensured.ok) {
          console.warn(`[migrate] skip submission ${s.id}: ops (${ensured.reason})`);
          continue;
        }
        const opsPool = await getOperationalPoolForTenant(s.tenant_id);
        if (!opsPool) continue;
        await opsPool.query(
          `INSERT INTO temple_payment_submissions (
             id, payment_ref, amount_cents, currency, transferred_date, notes,
             slip_file_name, slip_mime_type, storage_provider, storage_object_key, storage_public_url,
             status, invoice_id, created_at
           ) VALUES (
             $1::uuid, $2, $3, $4, $5::date, $6, $7, $8, $9, $10, $11, $12, $13::uuid, $14::timestamptz
           )
           ON CONFLICT (id) DO NOTHING`,
          [
            s.id,
            s.payment_ref,
            s.amount_cents,
            s.currency,
            s.transferred_date,
            s.notes,
            s.slip_file_name,
            s.slip_mime_type,
            s.storage_provider,
            s.storage_object_key,
            s.storage_public_url,
            s.status,
            s.invoice_id,
            s.created_at,
          ]
        );
        console.log(`[migrate] submission ${s.id} -> ops ${s.tenant_id}`);
      }
    } else {
      console.log("[migrate] public.temple_payment_submissions not present; skipping submission copy.");
    }
  } finally {
    await platform.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
