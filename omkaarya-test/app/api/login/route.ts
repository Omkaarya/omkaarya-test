import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { apiUrl, getApiBaseUrl, isApiBaseMisconfigured } from "@/lib/api-base";
import { getUserByEmail } from "@/lib/mock-db";
import { applyAuthCookieToResponse, signToken } from "@/lib/auth-utils";
import { nextJsonError, nextJsonSuccess, type ApiErrorBody, type ApiSuccessBody } from "@/lib/api-envelope";
import { isPlatformSuperAdminEmail } from "@/lib/super-admin-auth";

type BackendLoginEnvelope =
  | ApiSuccessBody<{ firstLogin: boolean; userId?: string | number; tenantId?: string | null }>
  | ApiErrorBody;

function mockLoginEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_MOCK_LOGIN === "1";
}

function parseBackendLogin(
  body: unknown
): {
  firstLogin: boolean;
  userId?: string;
  tenantId?: string | null;
  message?: string;
  reason?: string;
} | null {
  if (
    body === null ||
    typeof body !== "object" ||
    !("success" in body) ||
    (body as { success: unknown }).success !== true ||
    !("data" in body) ||
    typeof (body as { data: unknown }).data !== "object" ||
    (body as { data: unknown }).data === null
  ) {
    return null;
  }
  const envelope = body as ApiSuccessBody<{ firstLogin?: boolean; userId?: string | number; tenantId?: string | null }>;
  const d = envelope.data;
  const firstLogin = d.firstLogin !== false;
  const userId =
    typeof d.userId === "string" && d.userId.trim() !== ""
      ? d.userId.trim()
      : typeof d.userId === "number" && Number.isFinite(d.userId)
        ? String(d.userId)
        : undefined;
  const tenantId =
    d.tenantId === null ? null : typeof d.tenantId === "string" && d.tenantId.trim() !== "" ? d.tenantId.trim() : null;
  return {
    firstLogin,
    userId,
    tenantId,
    message: typeof envelope.message === "string" ? envelope.message : undefined,
    reason: typeof envelope.reason === "string" ? envelope.reason : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { email, tempPassword, password, rememberMe: rememberRaw } = payload as {
      email?: string;
      tempPassword?: string;
      password?: string;
      rememberMe?: unknown;
    };
    const rememberMe = rememberRaw === true;
    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    const rawPwd = password ?? tempPassword;
    const loginPassword = typeof rawPwd === "string" ? rawPwd.trim() : "";

    if (!trimmedEmail || !loginPassword) {
      return nextJsonError(400, "VALIDATION_ERROR", "Validation failed", "Email and password are required.");
    }

    if (isApiBaseMisconfigured()) {
      console.error(
        "[login] API base is localhost in production. Set API_BASE_URL or NEXT_PUBLIC_API_BASE_URL on Vercel."
      );
      return nextJsonError(
        503,
        "API_NOT_CONFIGURED",
        "Authentication service unavailable",
        "NEXT_PUBLIC_API_BASE_URL (or API_BASE_URL) must point to the deployed Express backend, not localhost."
      );
    }

    let backendFailed = false;
    let upstreamError: string | undefined;
    let parsedLogin: ReturnType<typeof parseBackendLogin> = null;

    try {
      const loginUrl = apiUrl("/api/login");
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password: loginPassword,
          tempPassword: loginPassword,
        }),
      });

      const data = (await res.json().catch(() => null)) as BackendLoginEnvelope | null;
      parsedLogin = res.ok ? parseBackendLogin(data) : null;

      if (!res.ok && data && typeof data === "object" && "success" in data && data.success === false) {
        return NextResponse.json(data, { status: res.status });
      }
    } catch (err) {
      backendFailed = true;
      upstreamError = err instanceof Error ? err.message : String(err);
      console.error("[login] Backend fetch failed:", { base: getApiBaseUrl(), upstreamError });
    }

    if (parsedLogin) {
      let platformSuper = false;
      try {
        platformSuper = await isPlatformSuperAdminEmail(trimmedEmail);
      } catch {
        /* DB unavailable: keep tenant-scoped JWT so login still succeeds */
      }
      const includeTenant =
        !platformSuper && parsedLogin.tenantId != null && parsedLogin.tenantId !== "";

      try {
        const token = await signToken(
          {
            userId: parsedLogin.userId ?? trimmedEmail,
            email: trimmedEmail,
            ...(includeTenant ? { tenantId: parsedLogin.tenantId as string } : {}),
          },
          { rememberMe }
        );
        const okRes = nextJsonSuccess(
          200,
          { 
            firstLogin: parsedLogin.firstLogin,
            tenantId: parsedLogin.tenantId ?? null,
            userId: parsedLogin.userId
          },
          parsedLogin.message ?? "Login successful",
          parsedLogin.reason ?? "Authenticated against the application database."
        );
        applyAuthCookieToResponse(okRes, token, { rememberMe });
        return okRes;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("JWT_SECRET")) {
          console.error("[login] JWT_SECRET missing on Next.js deployment");
          return nextJsonError(
            503,
            "AUTH_NOT_CONFIGURED",
            "Authentication service unavailable",
            "Set JWT_SECRET on the Next.js Vercel project (must match the backend JWT_SECRET)."
          );
        }
        throw err;
      }
    }

    if (!mockLoginEnabled()) {
      return nextJsonError(
        backendFailed ? 503 : 502,
        backendFailed ? "UPSTREAM_UNREACHABLE" : "UPSTREAM_INVALID_RESPONSE",
        "Authentication service unavailable",
        backendFailed
          ? `Could not reach the backend at ${getApiBaseUrl()}. ${upstreamError ?? "Check API_BASE_URL / NEXT_PUBLIC_API_BASE_URL and that the API is deployed."}`
          : "The application database login service returned an unexpected response."
      );
    }

    const user = await getUserByEmail(trimmedEmail);
    if (!user) {
      return nextJsonError(
        401,
        "AUTH_ERROR",
        "Authentication failed",
        "Invalid email or password."
      );
    }

    const isMatch = await bcrypt.compare(loginPassword, user.passwordHash);
    if (!isMatch) {
      return nextJsonError(
        401,
        "AUTH_ERROR",
        "Authentication failed",
        "Invalid email or password."
      );
    }

    const token = await signToken({ userId: user.id, email: user.email }, { rememberMe });
    const mockOk = nextJsonSuccess(
      200,
      { 
        firstLogin: false,
        tenantId: user.tenantId ?? null,
        userId: user.id
      },
      "Login successful",
      "Authenticated against local demo user store (no temporary password on this path)."
    );
    applyAuthCookieToResponse(mockOk, token, { rememberMe });
    return mockOk;
  } catch (error) {
    console.error("Login error:", error);
    const r = error instanceof Error ? error.message : "Internal server error during login.";
    return nextJsonError(500, "INTERNAL_ERROR", "Login failed", r);
  }
}
