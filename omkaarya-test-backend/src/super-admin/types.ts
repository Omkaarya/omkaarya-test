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

/** JSON shape stored in `temples.contact_phone` / `temples.fax` — aligned with frontend `PhoneRowValue`. */
export type PhoneRowJson = {
  countryCode: string;
  nationalNumber: string;
};

/** JSON shape stored in `temples.full_address` — aligned with frontend `TempleFullAddressDraft`. */
export type TempleFullAddressJson = {
  countryIso: string;
  state: string;
  city: string;
  postalCode: string;
  street: string;
};

/** GET /api/temple-admin/temple-profile — core (read-only) + details (foldable). */
export type TempleSessionProfileResponse = {
  success: true;
  templeId: string;
  core: {
    templeName: string;
    charity: { registered: boolean; registrationNumber: string };
    email: string;
    phone: PhoneRowJson;
    location: { countryIso: string; city: string };
  };
  details: {
    logoDataUrl: string | null;
    websiteUrl: string;
    fax: PhoneRowJson;
    domainSubdomain: string;
    establishedYear: string;
    fullAddress: TempleFullAddressJson;
  };
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

/** PATCH /api/temples/:tenantId — admin email is not modified server-side. */
export type UpdateTemplePayload = {
  temple: CreateTemplePayload["temple"];
  admin: {
    fullName: string;
    whatsapp: string;
    role: string;
  };
  planBilling: CreateTemplePayload["planBilling"];
  logoTempleDataUrl?: string | null;
};

/** GET /api/temples/:tenantId — hydrates the super-admin wizard. */
export type SuperAdminTempleDetailResponse = {
  tenantId: string;
  temple: CreateTemplePayload["temple"];
  admin: CreateTemplePayload["admin"];
  planBilling: CreateTemplePayload["planBilling"];
  logoTempleDataUrl: string | null;
};

export type PricingPlan = {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  popular: boolean;
  includedSeats: number;
  extraSeatPriceMonthly: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreatePricingPlanPayload = {
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  popular?: boolean;
  includedSeats: number;
  extraSeatPriceMonthly: number;
  features: string[];
};

export type UpdatePricingPlanPayload = Partial<CreatePricingPlanPayload>;
