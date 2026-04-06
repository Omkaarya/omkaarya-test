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
