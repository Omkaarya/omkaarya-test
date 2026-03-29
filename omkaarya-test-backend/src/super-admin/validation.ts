import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().email(),
  tempPassword: z.string().min(1),
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
