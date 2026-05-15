/** Super-admin `master_deities` row (matches Express `sendSuccess` payload). */
export type MasterDeityRow = {
  id: string;
  slug: string;
  displaySerial: number;
  displayCode: string;
  name: string;
  secondaryLabel: string | null;
  isActive: boolean;
  countryCode: string | null;
  placeholderHue: string | null;
  imageDataUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MasterDeityListPayload = {
  data: MasterDeityRow[];
  total: number;
  totalAll: number;
  totalPages: number;
  countries: string[];
};
