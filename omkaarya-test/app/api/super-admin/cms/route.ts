import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { fetchAllCmsPages, upsertCmsPage } from "@/lib/website-cms-db";
import type { CmsPageKey } from "@/lib/website-cms-defaults";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

const KEYS = new Set<CmsPageKey>(["home", "about", "contact", "settings"]);

/** GET /api/super-admin/cms — merged CMS bundle (defaults + DB). */
export async function GET() {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  try {
    const pages = await fetchAllCmsPages();
    return nextJsonSuccess(200, { pages }, "CMS content loaded", "Website CMS payloads merged with defaults.");
  } catch (err) {
    console.error("GET /api/super-admin/cms error:", err);
    const m = err instanceof Error ? err.message : String(err);
    return nextJsonError(500, "CMS_LOAD_FAILED", "Failed to load CMS content", m);
  }
}

type PutBody = { pageKey?: string; payload?: unknown };

/** PUT /api/super-admin/cms — upsert one page payload. */
export async function PUT(request: Request) {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  let body: PutBody;
  try {
    body = (await request.json()) as PutBody;
  } catch {
    return nextJsonError(400, "VALIDATION_ERROR", "Invalid JSON", "Request body must be JSON.");
  }

  const pageKey = body.pageKey as CmsPageKey | undefined;
  if (!pageKey || !KEYS.has(pageKey)) {
    return nextJsonError(
      400,
      "VALIDATION_ERROR",
      "Invalid pageKey",
      "pageKey must be one of: home, about, contact, settings."
    );
  }

  try {
    await upsertCmsPage(pageKey, body.payload ?? {});
    const pages = await fetchAllCmsPages();
    return nextJsonSuccess(200, { pages }, "CMS page saved", `Payload for \"${pageKey}\" was persisted.`);
  } catch (err) {
    console.error("PUT /api/super-admin/cms error:", err);
    const m = err instanceof Error ? err.message : String(err);
    return nextJsonError(500, "CMS_SAVE_FAILED", "Failed to save CMS content", m);
  }
}
