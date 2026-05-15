import { NextRequest, NextResponse } from "next/server";
import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { isTempleCustomHostTaken, isTempleSubdomainTaken } from "@/lib/temples-db";
import {
  buildOmkaaryaSubdomainHost,
  normalizeCustomDomainHost,
} from "@/lib/temple-portal-domain";
import { normalizeTempleSubdomainLabel } from "@/lib/temple-subdomain";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdminHeaders({ Accept: "application/json" });
  if (!auth.ok) return auth.response;

  const excludeTenantId = request.nextUrl.searchParams.get("excludeTenantId")?.trim() || undefined;
  const hostParam = request.nextUrl.searchParams.get("host")?.trim() ?? "";

  if (hostParam) {
    const host = normalizeCustomDomainHost(hostParam);
    if (!host) {
      return nextJsonSuccess(
        200,
        { available: false, host: "" },
        "Invalid hostname",
        "Enter a valid domain such as bookings.mytemple.org."
      );
    }
    try {
      const taken = await isTempleCustomHostTaken(host, excludeTenantId);
      return nextJsonSuccess(
        200,
        { available: !taken, host },
        taken ? "Hostname taken" : "Hostname available",
        taken ? `Another temple already uses "${host}".` : `"${host}" is available.`
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to check hostname";
      return nextJsonError(503, "HOST_CHECK_FAILED", "Could not verify hostname", message);
    }
  }

  const subdomain = normalizeTempleSubdomainLabel(
    request.nextUrl.searchParams.get("subdomain") ?? ""
  );

  if (!subdomain) {
    return nextJsonSuccess(200, { available: false, subdomain: "" }, "Invalid subdomain", "Provide a subdomain label.");
  }

  try {
    const taken = await isTempleSubdomainTaken(subdomain, excludeTenantId);
    const displayHost = buildOmkaaryaSubdomainHost(subdomain);
    return nextJsonSuccess(
      200,
      { available: !taken, subdomain },
      taken ? "Subdomain taken" : "Subdomain available",
      taken
        ? `Another temple already uses "${displayHost}".`
        : `"${displayHost}" is available.`
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to check subdomain";
    return nextJsonError(503, "SUBDOMAIN_CHECK_FAILED", "Could not verify subdomain", message);
  }
}
