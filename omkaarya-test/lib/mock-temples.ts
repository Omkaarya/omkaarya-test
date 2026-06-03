export type TempleStatus = "Active" | "Trial" | "Suspended";
export type TempleCompliance = "Verified" | "Pending" | "Not set up";
export type TemplePlan = string;

/** Temple row shape returned by GET /api/temples (loaded from PostgreSQL). */
export type MockTemple = {
  tenantId: string;
  name: string;
  slug: string;
  subdomain: string;
  portalHost: string;
  countryCode: string;
  countryFlag: string;
  city: string;
  plan: TemplePlan;
  devotees: number;
  status: TempleStatus;
  compliance: TempleCompliance;
  adminEmail: string;
  trialEndsAt?: string | null;
};
