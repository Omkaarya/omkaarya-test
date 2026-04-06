import { z } from "zod";

export const loginBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().optional(),
    tempPassword: z.string().optional(),
  })
  .refine(
    (d) => {
      const p = (d.password ?? "").trim();
      const t = (d.tempPassword ?? "").trim();
      return p.length > 0 || t.length > 0;
    },
    { message: "Password is required", path: ["password"] }
  );

export const setPasswordBodySchema = z.object({
  email: z.string().email(),
  tempPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const templeAdminRoleSchema = z.enum([
  "Temple Admin",
  "Head Priest",
  "Trustee",
  "Manager",
  "Accountant",
]);

export const templeAdminProfileBodySchema = z.object({
  sessionEmail: z.string().email(),
  email: z.string().email(),
  fullName: z.string().trim().pipe(z.string().min(1)),
  roles: z.array(templeAdminRoleSchema).min(1),
  phone: z
    .string()
    .trim()
    .pipe(z.string().min(8).max(24)),
});

const templeNested = z.object({
  tradition: z.string(),
  name: z.string(),
  deity: z.string(),
  country: z.string(),
  city: z.string(),
  address: z.string(),
  email: z.string(),
  phone: z.unknown(),
  whatsapp: z.unknown(),
  fax: z.unknown(),
  website: z.string(),
  subdomain: z.string(),
  establishedYear: z.string(),
});

const adminNested = z.object({
  fullName: z.string(),
  email: z.string(),
  whatsapp: z.string(),
  role: z.string(),
});

const planBillingNested = z.object({
  selectedPlan: z.string(),
  billingCycle: z.string(),
  trial: z.object({
    enabled: z.boolean(),
    days: z.number().nullable(),
  }),
});

export const createTempleBodySchema = z.object({
  temple: templeNested,
  admin: adminNested,
  planBilling: planBillingNested,
});

/** Matches frontend `DEITY_CATALOG` ids in `lib/deity-catalog.ts`. */
const deityCatalogIdSchema = z.enum([
  "pillaiyaar",
  "murugan",
  "shivan",
  "guruvayurappan",
  "amman",
  "aanjaneyar",
]);

export const templeDeitySelectionBodySchema = z
  .object({
    sessionEmail: z.string().email(),
    templeId: z.string().trim().pipe(z.string().min(1)),
    primaryDeityId: deityCatalogIdSchema,
    subDeityIds: z.array(deityCatalogIdSchema).default([]),
    customDeityNote: z.string().max(2000).optional(),
    preferCustomLater: z.boolean().optional(),
  })
  .refine((d) => !d.subDeityIds.includes(d.primaryDeityId), {
    message: "Sub-deities must not include the primary deity.",
    path: ["subDeityIds"],
  })
  .refine((d) => new Set(d.subDeityIds).size === d.subDeityIds.length, {
    message: "Duplicate sub-deity ids are not allowed.",
    path: ["subDeityIds"],
  });

export const templePlanSelectionBodySchema = z.object({
  sessionEmail: z.string().email(),
  templeId: z.string().trim().pipe(z.string().min(1)),
  planId: z.enum(["basic", "business", "enterprise"]),
  billing: z.enum(["monthly", "annual"]),
  confirmedAt: z.string().optional(),
});

/** No card fields — strict rejects PAN/CVV/expiry if sent. */
export const templePaymentOnboardingBodySchema = z
  .object({
    sessionEmail: z.string().email(),
    templeId: z.string().trim().pipe(z.string().min(1)),
    saveCardPreferred: z.boolean(),
  })
  .strict();

export const templeOnboardingCompleteBodySchema = z
  .object({
    sessionEmail: z.string().email(),
    templeId: z.string().trim().pipe(z.string().min(1)),
  })
  .strict();

const phoneRowJsonSchema = z.object({
  countryCode: z.string(),
  nationalNumber: z.string(),
});

const templeFullAddressJsonSchema = z.object({
  countryIso: z.string(),
  state: z.string(),
  city: z.string(),
  postalCode: z.string(),
  street: z.string(),
});

/** PATCH /api/temple-admin/temple-profile/details — foldable section only. */
export const templeProfileDetailsPatchBodySchema = z.object({
  sessionEmail: z.string().email(),
  websiteUrl: z.string(),
  fax: phoneRowJsonSchema,
  domainSubdomain: z.string(),
  establishedYear: z.string(),
  fullAddress: templeFullAddressJsonSchema,
  logoDataUrl: z.string().nullable(),
});
