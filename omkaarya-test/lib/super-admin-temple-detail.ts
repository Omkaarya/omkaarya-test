/** GET /api/temples/:tenantId — matches backend SuperAdminTempleDetailResponse */
export type SuperAdminTempleDetail = {
  tenantId: string;
  temple: {
    tradition: string;
    name: string;
    deity: string;
    country: string;
    city: string;
    address: string;
    email: string;
    phone: { countryCode: string; nationalNumber: string };
    whatsapp: { countryCode: string; nationalNumber: string };
    fax: { countryCode: string; nationalNumber: string };
    website: string;
    subdomain: string;
    establishedYear: string;
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
    selectedPricingPlanId?: string | null;
    billingCycle: string;
    trial: {
      enabled: boolean;
      days: number | null;
      endsAt?: string | null;
    };
  };
  logoTempleDataUrl: string | null;
};
