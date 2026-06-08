import { Router } from "express";
import { createTempleInventoryRouter } from "./inventory.routes.js";
import { createTempleInventoryEcosystemRouter } from "./inventory-ecosystem.routes.js";
import { createTempleMasterRouter } from "./master.routes.js";
import { createTemplePeoplesRouter } from "./peoples.routes.js";
import { createTempleSettingsRouter } from "./settings.routes.js";
import {
  createTempleBookingsRouter,
  createTempleDashboardRouter,
  createTempleDevoteesRouter,
  createTempleDonationsRouter,
  createTempleFinanceRouter,
  createTemplePosRouter,
} from "./operations.routes.js";
import {
  createTempleFinanceAssetsRouter,
  createTempleInventoryPrintRouter,
  createTempleKioskRouter,
  createTemplePrasadRouter,
  createTemplePublicSiteRouter,
} from "./extended-modules.routes.js";

/** Temple operational endpoints (JWT + tenant context; use per-temple PostgreSQL databases). */
export function createTempleOpsApiRouter(): Router {
  const r = Router();
  r.use("/temple-admin/inventory", createTempleInventoryRouter());
  r.use("/temple-admin/inventory", createTempleInventoryEcosystemRouter());
  r.use("/temple-admin/inventory/print", createTempleInventoryPrintRouter());
  r.use("/temple-admin/master", createTempleMasterRouter());
  r.use("/temple-admin/peoples", createTemplePeoplesRouter());
  r.use("/temple-admin/settings", createTempleSettingsRouter());
  r.use("/temple-admin/devotees", createTempleDevoteesRouter());
  r.use("/temple-admin/bookings", createTempleBookingsRouter());
  r.use("/temple-admin/pos", createTemplePosRouter());
  r.use("/temple-admin/donations", createTempleDonationsRouter());
  r.use("/temple-admin/finance", createTempleFinanceRouter());
  r.use("/temple-admin/finance/assets", createTempleFinanceAssetsRouter());
  r.use("/temple-admin/prasad", createTemplePrasadRouter());
  r.use("/temple-admin/public-site", createTemplePublicSiteRouter());
  r.use("/temple-admin/kiosk", createTempleKioskRouter());
  r.use("/temple-admin/dashboard", createTempleDashboardRouter());
  return r;
}
