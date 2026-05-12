import type { Pool, PoolClient } from "pg";

export type TempleAdminDataFields = {
  contactPhone: unknown;
  contactWhatsapp: unknown;
  fax: unknown;
  websiteUrl: string | null;
  establishedYear: string | null;
  fullAddress: unknown;
  logoDataUrl: string | null;
  tradition: string | null;
  charityRegistered: boolean;
  charityRegistrationNumber: string | null;
  primaryDeityId: string | null;
  subDeityIds: string[];
  deityCustomNote: string | null;
  deityPreferCustomLater: boolean | null;
};

export async function upsertTempleAdminData(
  client: Pool | PoolClient,
  input: TempleAdminDataFields
): Promise<void> {
  await client.query(
    `INSERT INTO temple_admin_data (
       id,
       contact_phone, contact_whatsapp, fax,
       website_url, established_year, full_address, logo_data_url,
       tradition, charity_registered, charity_registration_number,
       primary_deity_id, sub_deity_ids, deity_custom_note, deity_prefer_custom_later,
       updated_at
     ) VALUES (
       1,
       $1::jsonb, $2::jsonb, $3::jsonb,
       $4, $5, $6::jsonb, $7,
       $8, $9, $10,
       $11, $12, $13, $14,
       NOW()
     )
     ON CONFLICT (id) DO UPDATE SET
       contact_phone = EXCLUDED.contact_phone,
       contact_whatsapp = EXCLUDED.contact_whatsapp,
       fax = EXCLUDED.fax,
       website_url = EXCLUDED.website_url,
       established_year = EXCLUDED.established_year,
       full_address = EXCLUDED.full_address,
       logo_data_url = EXCLUDED.logo_data_url,
       tradition = EXCLUDED.tradition,
       charity_registered = EXCLUDED.charity_registered,
       charity_registration_number = EXCLUDED.charity_registration_number,
       primary_deity_id = EXCLUDED.primary_deity_id,
       sub_deity_ids = EXCLUDED.sub_deity_ids,
       deity_custom_note = EXCLUDED.deity_custom_note,
       deity_prefer_custom_later = EXCLUDED.deity_prefer_custom_later,
       updated_at = NOW()`,
    [
      JSON.stringify(input.contactPhone ?? {}),
      JSON.stringify(input.contactWhatsapp ?? {}),
      JSON.stringify(input.fax ?? {}),
      input.websiteUrl,
      input.establishedYear,
      JSON.stringify(input.fullAddress ?? {}),
      input.logoDataUrl,
      input.tradition,
      input.charityRegistered,
      input.charityRegistrationNumber,
      input.primaryDeityId,
      input.subDeityIds,
      input.deityCustomNote,
      input.deityPreferCustomLater,
    ]
  );
}

/** PATCH temple profile details (foldable section + charity) without overwriting phone/deity fields. */
export async function patchTempleAdminDetails(
  client: Pool | PoolClient,
  input: {
    websiteUrl: string;
    fax: unknown;
    establishedYear: string;
    fullAddress: unknown;
    logoDataUrl: string | null;
    charityRegistered: boolean;
    charityRegistrationNumber: string | null;
  }
): Promise<void> {
  await client.query(
    `UPDATE temple_admin_data SET
       website_url = $1,
       fax = $2::jsonb,
       established_year = $3,
       full_address = $4::jsonb,
       logo_data_url = $5,
       charity_registered = $6,
       charity_registration_number = $7,
       updated_at = NOW()
     WHERE id = 1`,
    [
      input.websiteUrl.trim() || null,
      JSON.stringify(input.fax ?? {}),
      input.establishedYear.trim() || null,
      JSON.stringify(input.fullAddress ?? {}),
      input.logoDataUrl,
      input.charityRegistered,
      input.charityRegistrationNumber,
    ]
  );
}

export async function updateTempleAdminOnboardingFlags(
  client: Pool | PoolClient,
  input: {
    paymentOnboardingCompletedAt?: Date | null;
    paymentSaveCardPreference?: boolean | null;
    onboardingCompletedAt?: Date | null;
  }
): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (input.paymentOnboardingCompletedAt !== undefined) {
    sets.push(`payment_onboarding_completed_at = $${i++}`);
    vals.push(input.paymentOnboardingCompletedAt);
  }
  if (input.paymentSaveCardPreference !== undefined) {
    sets.push(`payment_save_card_preference = $${i++}`);
    vals.push(input.paymentSaveCardPreference);
  }
  if (input.onboardingCompletedAt !== undefined) {
    sets.push(`onboarding_completed_at = $${i++}`);
    vals.push(input.onboardingCompletedAt);
  }
  if (sets.length === 0) return;
  vals.push(1);
  await client.query(
    `UPDATE temple_admin_data SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${i}`,
    vals
  );
}
