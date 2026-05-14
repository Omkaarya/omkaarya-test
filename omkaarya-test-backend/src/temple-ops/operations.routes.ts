import { Router } from "express";
import { z } from "zod";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import { requireTempleJwtSession } from "./middleware/require-temple-jwt.js";
import { getTenantPoolOrNull, requireTenantPool } from "./helpers.js";
import * as ops from "./operations.repository.js";
import { dateTimeString, moneyAmount, optionalQueryString, positiveQueryInt, routeParam } from "./route-helpers.js";

// ── Devotees ────────────────────────────────────────────────────────

const devoteeBody = z.object({
  fullName: z.string().min(1).max(300),
  phone: z.string().max(60).nullable().optional(),
  phoneCountryCode: z.string().max(10).nullable().optional(),
  email: z.string().email().max(200).nullable().optional().or(z.literal("")),
  address: z.record(z.string(), z.unknown()).optional().default({}),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional().or(z.literal("")),
  gotra: z.string().max(120).nullable().optional(),
  rashi: z.string().max(120).nullable().optional(),
  nakshatra: z.string().max(120).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});
const devoteePatch = devoteeBody.partial();

export function createTempleDevoteesRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  r.get(
    "/",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const search = optionalQueryString(req.query.search);
      const items = pool ? await ops.listDevotees(pool, search) : [];
      sendSuccess(res, 200, { items }, "Devotees loaded", `${items.length} devotees.`);
    })
  );

  r.post(
    "/",
    validateBody(devoteeBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof devoteeBody>;
      const created = await ops.insertDevotee(pool, {
        fullName: body.fullName,
        phone: body.phone ?? null,
        phoneCountryCode: body.phoneCountryCode ?? null,
        email: typeof body.email === "string" && body.email.length > 0 ? body.email : null,
        address: body.address ?? {},
        dateOfBirth: typeof body.dateOfBirth === "string" && body.dateOfBirth.length > 0 ? body.dateOfBirth : null,
        gotra: body.gotra ?? null,
        rashi: body.rashi ?? null,
        nakshatra: body.nakshatra ?? null,
        notes: body.notes ?? null,
      });
      sendSuccess(res, 201, { id: created.id }, "Devotee created", "");
    })
  );

  r.patch(
    "/:id",
    validateBody(devoteePatch),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const body = req.body as z.infer<typeof devoteePatch>;
      const ok = await ops.updateDevotee(pool, id, {
        ...body,
        email: body.email === "" ? null : body.email ?? undefined,
        dateOfBirth: body.dateOfBirth === "" ? null : body.dateOfBirth ?? undefined,
      } as never);
      if (!ok) throw new HttpError(404, "Devotee not found.", { code: "DEVOTEE_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Devotee updated", "");
    })
  );

  r.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await ops.softDeleteDevotee(pool, id);
      if (!ok) throw new HttpError(404, "Devotee not found.", { code: "DEVOTEE_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Devotee deleted", "");
    })
  );

  return r;
}

// ── Bookings ────────────────────────────────────────────────────────

const bookingBody = z.object({
  reference: z.string().min(1).max(120),
  devoteeId: z.string().nullable().optional(),
  poojaSevaId: z.string().nullable().optional(),
  poojaName: z.string().min(1).max(300),
  scheduledAt: dateTimeString,
  durationMinutes: z.number().int().positive().nullable().optional(),
  priestName: z.string().max(200).nullable().optional(),
  amountTotal: moneyAmount.optional().default(0),
  currency: z.string().max(8).optional().default("INR"),
  paymentStatus: z.enum(["unpaid", "paid", "refunded", "partial"]).optional().default("unpaid"),
  status: z
    .enum(["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"])
    .optional()
    .default("pending"),
  notes: z.string().max(2000).nullable().optional(),
  source: z.string().max(120).nullable().optional(),
});

const bookingStatusBody = z.object({
  status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"]),
});

export function createTempleBookingsRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  r.get(
    "/",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool
        ? await ops.listBookings(pool, {
            from: optionalQueryString(req.query.from),
            to: optionalQueryString(req.query.to),
            status: optionalQueryString(req.query.status),
            devoteeId: optionalQueryString(req.query.devoteeId),
          })
        : [];
      sendSuccess(res, 200, { items }, "Bookings loaded", `${items.length} bookings.`);
    })
  );

  r.post(
    "/",
    validateBody(bookingBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof bookingBody>;
      const created = await ops.insertBooking(pool, {
        reference: body.reference,
        devoteeId: body.devoteeId ?? null,
        poojaSevaId: body.poojaSevaId ?? null,
        poojaName: body.poojaName,
        scheduledAt: body.scheduledAt,
        durationMinutes: body.durationMinutes ?? null,
        priestName: body.priestName ?? null,
        amountTotal: body.amountTotal ?? 0,
        currency: body.currency ?? "INR",
        paymentStatus: body.paymentStatus ?? "unpaid",
        status: body.status ?? "pending",
        notes: body.notes ?? null,
        source: body.source ?? null,
      });
      sendSuccess(res, 201, { id: created.id }, "Booking created", "");
    })
  );

  r.post(
    "/:id/transition",
    validateBody(bookingStatusBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const body = req.body as z.infer<typeof bookingStatusBody>;
      const ok = await ops.updateBookingStatus(pool, id, body.status);
      if (!ok) throw new HttpError(404, "Booking not found.", { code: "BOOKING_NOT_FOUND" });
      sendSuccess(res, 200, { id, status: body.status }, "Booking updated", "");
    })
  );

  return r;
}

// ── POS ─────────────────────────────────────────────────────────────

const registerBody = z.object({
  code: z.string().min(1).max(60),
  name: z.string().min(1).max(200),
  storeId: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

const sessionOpenBody = z.object({
  registerId: z.string().min(1),
  openedBy: z.string().max(200).nullable().optional(),
  openingFloat: z.number().nonnegative().optional().default(0),
});

const sessionCloseBody = z.object({
  closedBy: z.string().max(200).nullable().optional(),
  closingAmount: z.number().nonnegative().optional().default(0),
});

const posOrderBody = z.object({
  reference: z.string().min(1).max(120),
  sessionId: z.string().nullable().optional(),
  registerId: z.string().nullable().optional(),
  devoteeId: z.string().nullable().optional(),
  totalAmount: moneyAmount,
  taxAmount: moneyAmount.optional().default(0),
  discountAmount: moneyAmount.optional().default(0),
  currency: z.string().max(8).optional().default("INR"),
  paymentMethod: z.string().max(60).nullable().optional(),
  paymentStatus: z.enum(["paid", "refunded", "pending"]).optional().default("paid"),
  notes: z.string().max(1000).nullable().optional(),
  lines: z
    .array(
      z.object({
        productId: z.string().nullable().optional(),
        description: z.string().min(1).max(300),
        quantity: z.number().positive(),
        unitAmount: moneyAmount,
        totalAmount: moneyAmount,
      })
    )
    .min(1),
}).superRefine((order, ctx) => {
  const linesTotal = order.lines.reduce((sum, line) => sum + line.totalAmount, 0);
  const expectedTotal = Math.round((linesTotal + order.taxAmount - order.discountAmount) * 100) / 100;
  const submittedTotal = Math.round(order.totalAmount * 100) / 100;
  if (Math.abs(expectedTotal - submittedTotal) > 0.01) {
    ctx.addIssue({
      code: "custom",
      path: ["totalAmount"],
      message: "Order total must equal line totals plus tax minus discount.",
    });
  }
});

export function createTemplePosRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  r.get(
    "/registers",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await ops.listRegisters(pool) : [];
      sendSuccess(res, 200, { items }, "Registers loaded", `${items.length} registers.`);
    })
  );

  r.post(
    "/registers",
    validateBody(registerBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof registerBody>;
      const created = await ops.insertRegister(pool, {
        code: body.code,
        name: body.name,
        storeId: body.storeId ?? null,
        isActive: body.isActive ?? true,
      });
      sendSuccess(res, 201, { id: created.id }, "Register created", "");
    })
  );

  r.get(
    "/sessions",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const registerId = optionalQueryString(req.query.registerId);
      const items = pool ? await ops.listSessions(pool, registerId) : [];
      sendSuccess(res, 200, { items }, "Sessions loaded", `${items.length} sessions.`);
    })
  );

  r.post(
    "/sessions/open",
    validateBody(sessionOpenBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof sessionOpenBody>;
      const created = await ops.openSession(pool, {
        registerId: body.registerId,
        openedBy: body.openedBy ?? null,
        openingFloat: body.openingFloat ?? 0,
      });
      sendSuccess(res, 201, { id: created.id }, "Session opened", "");
    })
  );

  r.post(
    "/sessions/:id/close",
    validateBody(sessionCloseBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const body = req.body as z.infer<typeof sessionCloseBody>;
      const ok = await ops.closeSession(pool, id, {
        closedBy: body.closedBy ?? null,
        closingAmount: body.closingAmount ?? 0,
      });
      if (!ok) throw new HttpError(409, "Session is not open.", { code: "POS_SESSION_NOT_OPEN" });
      sendSuccess(res, 200, { id }, "Session closed", "");
    })
  );

  r.get(
    "/orders",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const limit = positiveQueryInt(req.query.limit);
      const items = pool ? await ops.listPosOrders(pool, limit) : [];
      sendSuccess(res, 200, { items }, "POS orders loaded", `${items.length} orders.`);
    })
  );

  r.post(
    "/orders",
    validateBody(posOrderBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof posOrderBody>;
      const created = await ops.createPosOrder(pool, {
        reference: body.reference,
        sessionId: body.sessionId ?? null,
        registerId: body.registerId ?? null,
        devoteeId: body.devoteeId ?? null,
        totalAmount: body.totalAmount,
        taxAmount: body.taxAmount ?? 0,
        discountAmount: body.discountAmount ?? 0,
        currency: body.currency ?? "INR",
        paymentMethod: body.paymentMethod ?? null,
        paymentStatus: body.paymentStatus ?? "paid",
        notes: body.notes ?? null,
        lines: body.lines.map((l) => ({
          productId: l.productId ?? null,
          description: l.description,
          quantity: l.quantity,
          unitAmount: l.unitAmount,
          totalAmount: l.totalAmount,
        })),
      });
      sendSuccess(res, 201, { id: created.id }, "POS order saved", "");
    })
  );

  return r;
}

// ── Donations ───────────────────────────────────────────────────────

const donationBody = z.object({
  receiptNumber: z.string().min(1).max(120),
  devoteeId: z.string().nullable().optional(),
  donorName: z.string().max(300).nullable().optional(),
  donorPhone: z.string().max(60).nullable().optional(),
  donorEmail: z.string().email().max(200).nullable().optional().or(z.literal("")),
  amount: moneyAmount,
  currency: z.string().max(8).optional().default("INR"),
  category: z.string().max(120).nullable().optional(),
  paymentMethod: z.string().max(60).nullable().optional(),
  reference: z.string().max(120).nullable().optional(),
  isAnonymous: z.boolean().optional().default(false),
  notes: z.string().max(1000).nullable().optional(),
  occurredAt: dateTimeString,
});

export function createTempleDonationsRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  r.get(
    "/",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const limit = positiveQueryInt(req.query.limit);
      const items = pool ? await ops.listDonations(pool, limit) : [];
      sendSuccess(res, 200, { items }, "Donations loaded", `${items.length} donations.`);
    })
  );

  r.post(
    "/",
    validateBody(donationBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof donationBody>;
      const created = await ops.insertDonation(pool, {
        receiptNumber: body.receiptNumber,
        devoteeId: body.devoteeId ?? null,
        donorName: body.donorName ?? null,
        donorPhone: body.donorPhone ?? null,
        donorEmail: typeof body.donorEmail === "string" && body.donorEmail.length > 0 ? body.donorEmail : null,
        amount: body.amount,
        currency: body.currency ?? "INR",
        category: body.category ?? null,
        paymentMethod: body.paymentMethod ?? null,
        reference: body.reference ?? null,
        isAnonymous: body.isAnonymous ?? false,
        notes: body.notes ?? null,
        occurredAt: body.occurredAt,
      });
      sendSuccess(res, 201, { id: created.id }, "Donation recorded", "");
    })
  );

  return r;
}

// ── Finance ────────────────────────────────────────────────────────

const financeEntryBody = z.object({
  entryKind: z.enum(["expense", "income", "adjustment"]),
  amount: moneyAmount,
  currency: z.string().max(8).optional().default("INR"),
  category: z.string().max(120).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  reference: z.string().max(120).nullable().optional(),
  occurredAt: dateTimeString,
  createdBy: z.string().max(200).nullable().optional(),
});

export function createTempleFinanceRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  r.get(
    "/transactions",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool
        ? await ops.listFinanceTransactions(pool, {
            from: optionalQueryString(req.query.from),
            to: optionalQueryString(req.query.to),
            type: optionalQueryString(req.query.type),
            source: optionalQueryString(req.query.source),
            limit: positiveQueryInt(req.query.limit),
          })
        : [];
      sendSuccess(res, 200, { items }, "Transactions loaded", `${items.length} transactions.`);
    })
  );

  r.get(
    "/entries",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const limit = positiveQueryInt(req.query.limit);
      const items = pool ? await ops.listFinanceEntries(pool, limit) : [];
      sendSuccess(res, 200, { items }, "Entries loaded", `${items.length} entries.`);
    })
  );

  r.post(
    "/entries",
    validateBody(financeEntryBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof financeEntryBody>;
      const created = await ops.insertFinanceEntry(pool, {
        entryKind: body.entryKind,
        amount: body.amount,
        currency: body.currency ?? "INR",
        category: body.category ?? null,
        description: body.description ?? null,
        reference: body.reference ?? null,
        occurredAt: body.occurredAt,
        createdBy: body.createdBy ?? null,
      });
      sendSuccess(res, 201, { id: created.id }, "Entry saved", "");
    })
  );

  return r;
}

// ── Dashboard ──────────────────────────────────────────────────────

export function createTempleDashboardRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  r.get(
    "/summary",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      if (!pool) {
        sendSuccess(
          res,
          200,
          {
            summary: {
              bookings: { total: 0, today: 0, upcoming: 0, confirmed: 0 },
              pos: { todayTotal: "0", todayOrders: 0, openSessions: 0 },
              donations: { todayTotal: "0", monthTotal: "0", donorCount: 0 },
              inventory: { totalProducts: 0, lowStock: 0, outOfStock: 0 },
              finance: { incomeMonth: "0", expenseMonth: "0" },
            },
          },
          "Dashboard summary",
          "Temple operational database is not configured."
        );
        return;
      }
      const summary = await ops.getDashboardSummary(pool);
      sendSuccess(res, 200, { summary }, "Dashboard summary loaded", "");
    })
  );

  return r;
}
