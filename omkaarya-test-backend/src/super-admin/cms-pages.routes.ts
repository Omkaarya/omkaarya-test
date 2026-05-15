import { Router } from "express";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import type { CmsPageKey } from "./cms-pages-defaults.js";
import { PostgresCmsPagesRepository } from "./cms-pages.repository.js";

const KEYS = new Set<CmsPageKey>(["home", "about", "contact", "settings"]);

export function createSuperAdminCmsRouter(repo: PostgresCmsPagesRepository): Router {
  const r = Router();

  r.get(
    "/super-admin/cms",
    asyncHandler(async (_req, res) => {
      const pages = await repo.fetchAll();
      sendSuccess(res, 200, { pages }, "CMS content loaded", "Website CMS payloads merged with defaults.");
    })
  );

  r.put(
    "/super-admin/cms",
    asyncHandler(async (req, res) => {
      const pageKey = req.body?.pageKey as CmsPageKey | undefined;
      if (!pageKey || !KEYS.has(pageKey)) {
        throw new HttpError(400, "Invalid pageKey", {
          code: "VALIDATION_ERROR",
          reason: "pageKey must be one of: home, about, contact, settings.",
        });
      }
      await repo.upsertPage(pageKey, req.body?.payload ?? {});
      const pages = await repo.fetchAll();
      sendSuccess(res, 200, { pages }, "CMS page saved", `Payload for "${pageKey}" was persisted.`);
    })
  );

  return r;
}
