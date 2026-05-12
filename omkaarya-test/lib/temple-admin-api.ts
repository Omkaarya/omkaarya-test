/** Shared DTOs returned by `/api/temple-admin/...` endpoints (mirrors backend repos). */

import type { ApiSuccessBody } from "@/lib/api-envelope";
import { jsonApiErrorMessage } from "@/lib/api-envelope";

// ── Master ────────────────────────────────────────────────────────────

export type PoojaSeva = {
  id: string;
  name: string;
  code: string | null;
  category: string;
  duration_minutes: number | null;
  price_amount: string;
  currency: string;
  prasad_text: string | null;
  priest_name: string | null;
  description: string | null;
  online_enabled: boolean;
  is_active: boolean;
  sort_order: number;
};

export type Schedule = {
  id: string;
  pooja_seva_id: string | null;
  pooja_name: string;
  days: string[];
  time_of_day: string | null;
  priest_name: string | null;
  max_slots: number | null;
  cutoff_hours: number | null;
  is_active: boolean;
};

export type Festival = {
  id: string;
  name: string;
  festival_date: string | null;
  category: string;
  description: string | null;
  priest_name: string | null;
  is_active: boolean;
};

export type PanchangamEntry = {
  id: string;
  panch_date: string;
  festival_label: string | null;
  type_label: string | null;
  auspicious_label: string | null;
  notes: string | null;
};

export type Uom = {
  id: string;
  kind: "base" | "bulk";
  name: string;
  abbreviation: string;
  type_label: string;
  base_unit_id: string | null;
  quantity_per_bulk: string | null;
};

// ── Peoples ──────────────────────────────────────────────────────────

export type Role = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_system: boolean;
  required_plan: string;
  user_count: number;
  permission_count: number;
};

export type RolePermission = {
  id: string;
  role_id: string;
  module_key: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
};

export type StaffMember = {
  id: string;
  external_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  phone_country_code: string | null;
  role_id: string | null;
  role_slug: string | null;
  role_name: string | null;
  status: "active" | "inactive" | "pending" | "suspended";
  joined_at: string | null;
  notes: string | null;
};

export type StaffInvitation = {
  id: string;
  email: string;
  role_id: string | null;
  role_name: string | null;
  invited_by: string | null;
  status: "pending" | "accepted" | "expired" | "revoked";
  expires_at: string | null;
  accepted_at: string | null;
  created_at: string;
};

// ── Settings ─────────────────────────────────────────────────────────

export type SettingsAreaResponse = {
  area: string;
  payload: Record<string, unknown>;
  updatedAt: string | null;
};

export type AllSettingsResponse = {
  areas: Record<string, Record<string, unknown>>;
};

// ── Inventory ecosystem ─────────────────────────────────────────────

export type InventoryCategory = {
  id: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  sort_order: number;
};

export type InventorySupplier = {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  payment_terms: string | null;
  is_active: boolean;
};

export type InventoryStore = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

export type InventoryTransfer = {
  id: string;
  reference: string;
  from_store_id: string | null;
  to_store_id: string | null;
  from_store_name: string | null;
  to_store_name: string | null;
  status: "draft" | "dispatched" | "received" | "cancelled";
  dispatched_at: string | null;
  received_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  created_at: string;
};

export type InventoryTransferLine = {
  id: string;
  product_id: string;
  product_name: string | null;
  quantity: string;
};

export type InventoryPurchaseOrder = {
  id: string;
  po_number: string;
  supplier_id: string | null;
  supplier_name: string | null;
  status: "draft" | "sent" | "received" | "partial" | "cancelled";
  expected_at: string | null;
  received_at: string | null;
  total_amount: string;
  currency: string;
  notes: string | null;
  created_at: string;
};

export type InventoryPurchaseOrderLine = {
  id: string;
  product_id: string;
  product_name: string | null;
  quantity: string;
  unit_cost: string;
  received_qty: string;
};

export type InventoryBom = {
  id: string;
  name: string;
  pooja_seva_id: string | null;
  pooja_seva_name: string | null;
  description: string | null;
  is_active: boolean;
};

export type InventoryBomLine = {
  id: string;
  product_id: string;
  product_name: string | null;
  quantity: string;
  is_optional: boolean;
  notes: string | null;
};

export type InventoryLowStockProduct = {
  id: string;
  name: string;
  sku: string;
  quantity: string;
  reorder_point: string | null;
  unit: string;
  category: string;
  status: "low" | "out";
};

export type InventoryStockLedgerEntry = {
  id: string;
  product_id: string;
  product_name: string | null;
  movement_kind: string;
  quantity_delta: string;
  store_id: string | null;
  reference_type: string | null;
  reference_id: string | null;
  reason: string | null;
  created_by: string | null;
  created_at: string;
};

// ── Operations: devotees, bookings, POS, donations, finance, dashboard ──

export type Devotee = {
  id: string;
  full_name: string;
  phone: string | null;
  phone_country_code: string | null;
  email: string | null;
  address: Record<string, unknown>;
  date_of_birth: string | null;
  gotra: string | null;
  rashi: string | null;
  nakshatra: string | null;
  notes: string | null;
};

export type Booking = {
  id: string;
  reference: string;
  devotee_id: string | null;
  devotee_name: string | null;
  pooja_seva_id: string | null;
  pooja_name: string;
  scheduled_at: string;
  duration_minutes: number | null;
  priest_name: string | null;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  amount_total: string;
  currency: string;
  payment_status: "unpaid" | "paid" | "refunded" | "partial";
  notes: string | null;
  source: string | null;
  created_at: string;
};

export type PosRegister = {
  id: string;
  code: string;
  name: string;
  store_id: string | null;
  store_name: string | null;
  is_active: boolean;
};

export type PosSession = {
  id: string;
  register_id: string;
  register_name: string;
  opened_by: string | null;
  opened_at: string;
  opening_float: string;
  closed_by: string | null;
  closed_at: string | null;
  closing_amount: string | null;
  status: "open" | "closed";
};

export type PosOrder = {
  id: string;
  reference: string;
  session_id: string | null;
  register_id: string | null;
  devotee_id: string | null;
  total_amount: string;
  tax_amount: string;
  discount_amount: string;
  currency: string;
  payment_method: string | null;
  payment_status: "paid" | "refunded" | "pending";
  notes: string | null;
  occurred_at: string;
  line_count: number;
};

export type Donation = {
  id: string;
  receipt_number: string;
  devotee_id: string | null;
  devotee_name: string | null;
  donor_name: string | null;
  donor_phone: string | null;
  donor_email: string | null;
  amount: string;
  currency: string;
  category: string | null;
  payment_method: string | null;
  reference: string | null;
  is_anonymous: boolean;
  notes: string | null;
  occurred_at: string;
};

export type FinanceTransaction = {
  id: string;
  source_table: "booking" | "pos_order" | "donation" | "finance_entry";
  source_id: string;
  reference: string;
  type: string;
  amount: string;
  currency: string;
  devotee_id: string | null;
  description: string;
  occurred_at: string;
  created_at: string;
};

export type FinanceEntry = {
  id: string;
  entry_kind: "expense" | "income" | "adjustment";
  amount: string;
  currency: string;
  category: string | null;
  description: string | null;
  reference: string | null;
  occurred_at: string;
  created_by: string | null;
};

export type DashboardSummary = {
  bookings: { total: number; today: number; upcoming: number; confirmed: number };
  pos: { todayTotal: string; todayOrders: number; openSessions: number };
  donations: { todayTotal: string; monthTotal: string; donorCount: number };
  inventory: { totalProducts: number; lowStock: number; outOfStock: number };
  finance: { incomeMonth: string; expenseMonth: string };
};

// ── Helpers ──────────────────────────────────────────────────────────

/** Fetches a temple-admin endpoint and unwraps the success envelope, throwing on errors. */
export async function fetchTempleAdminJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = jsonApiErrorMessage(data) || `Request failed (${res.status}).`;
    throw new Error(message);
  }
  const ok = data as ApiSuccessBody<T> | null;
  if (!ok || ok.success !== true) {
    throw new Error("Unexpected response shape.");
  }
  return ok.data;
}
