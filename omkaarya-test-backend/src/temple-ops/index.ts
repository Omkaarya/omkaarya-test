import { Router } from "express";
import { createTempleInventoryRouter } from "./inventory.routes.js";

/** Temple operational endpoints (JWT + tenant context; use per-temple PostgreSQL databases). */
export function createTempleOpsApiRouter(): Router {
  const r = Router();
  r.use("/temple-admin/inventory", createTempleInventoryRouter());
  return r;
}
