export type TempleStatus = "Active" | "Trial" | "Suspended";
export type TempleCompliance = "Verified" | "Pending" | "Not set up";
export type TemplePlan = "Aaaradhana" | "Sankalpa" | "Mandala" | "Free";

/** Temple row shape returned by GET /api/temples (loaded from PostgreSQL). */
export type MockTemple = {
  tenantId: string;
  name: string;
  slug: string;
  countryCode: string;
  countryFlag: string;
  city: string;
  plan: TemplePlan;
  devotees: number;
  status: TempleStatus;
  compliance: TempleCompliance;
  adminEmail: string;
};
