export type TempleStatus = "Active" | "Trial" | "Suspended";
export type TempleCompliance = "Verified" | "Pending" | "Not set up";
export type TemplePlan = "Prarambha" | "Sankalpa" | "Aaradhana" | "Free";

/** Row returned by GET /api/temples — matches frontend MockTemple. */
export type TempleRecord = {
  tenantId: string;
  name: string;
  slug: string;
  /** Short portal label (no protocol); from `domain_subdomain` or derived from `slug`. */
  subdomain: string;
  /** Canonical host for the temple microsite, e.g. `name.omkaarya.com`. */
  portalHost: string;
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

/** JSON shape stored in temple-ops `temple_admin_data.contact_phone` / `fax` — aligned with frontend `PhoneRowValue`. */
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
  /** Plan from super-admin create (or DB); used to preselect on temple onboarding “Confirm your plan”. */
  provisioningPlan: {
    pricingPlanId: string | null;
    planName: string | null;
    billing: "monthly" | "annual";
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
    /** When true, `charityRegistrationNumber` should be set (enforced in validation). */
    charityRegistered: boolean;
    charityRegistrationNumber: string;
  };
  admin: {
    fullName: string;
    email: string;
    whatsapp: string;
    role: string;
  };
  planBilling: {
    selectedPlan: string;
    /** `pricing_plans.id` (UUID) from the super-admin catalog — preferred for persisting `temples.pricing_plan_id`. */
    selectedPricingPlanId?: string | null;
    billingCycle: string;
    trial: {
      enabled: boolean;
      days: number | null;
    };
  };
  /**
   * Base64 `data:` is uploaded to Cloudinary; an existing `https` URL is stored as-is.
   * DB holds a Cloudinary `secure_url` (same pattern as payment slip uploads), not a raw `data:` string.
   */
  logoTempleDataUrl?: string | null;
  /**
   * Base64 `data:` is uploaded to Cloudinary; DB holds `https` on `users.profile_image_url`.
   */
  adminProfileDataUrl?: string | null;
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

/** GET /api/pricing-plans/comparison — per-plan feature matrix for onboarding UI */
export type PricingPlanComparisonCell = {
  enabled: boolean;
  limit: number | null;
};

export type PricingPlanComparisonRow = {
  featureId: number;
  name: string;
  key: string;
  moduleKey: string;
  hasLimit: boolean;
  values: Record<string, PricingPlanComparisonCell>;
};

export type PricingPlanComparisonResponse = {
  plans: { id: string; name: string }[];
  features: PricingPlanComparisonRow[];
};
