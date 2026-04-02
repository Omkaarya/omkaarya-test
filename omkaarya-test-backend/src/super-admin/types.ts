export type TempleStatus = "Active" | "Trial" | "Suspended";
export type TempleCompliance = "Verified" | "Pending" | "Not set up";
export type TemplePlan = "Aaaradhana" | "Sankalpa" | "Mandala" | "Free";

/** Row returned by GET /api/temples — matches frontend MockTemple. */
export type TempleRecord = {
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

export type TemplesSortBy = "last7" | "name" | "devotees";

export type TemplesQueryInput = {
  q: string;
  status: "all" | TempleStatus;
  country: "all" | string;
  sortBy: TemplesSortBy;
  page: number;
  pageSize: number;
};

export type TemplesListResponse = {
  data: TempleRecord[];
  total: number;
  totalAll: number;
  page: number;
  pageSize: number;
  totalPages: number;
  countries: string[];
};

export type CreateTemplePayload = {
  temple: {
    tradition: string;
    name: string;
    deity: string;
    country: string;
    city: string;
    address: string;
    email: string;
    phone: unknown;
    whatsapp: unknown;
    fax: unknown;
    website: string;
    subdomain: string;
    establishedYear: string;
  };
  admin: {
    fullName: string;
    email: string;
    whatsapp: string;
    role: string;
  };
  planBilling: {
    selectedPlan: string;
    billingCycle: string;
    trial: {
      enabled: boolean;
      days: number | null;
    };
  };
};
