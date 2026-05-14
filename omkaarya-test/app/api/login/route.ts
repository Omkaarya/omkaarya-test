import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { apiUrl } from "@/lib/api-base";
import { getUserByEmail } from "@/lib/mock-db";
import { signToken, setAuthCookie } from "@/lib/auth-utils";
import { nextJsonError, nextJsonSuccess, type ApiErrorBody, type ApiSuccessBody } from "@/lib/api-envelope";

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

    let backendFailed = false;
    try {
      const res = await fetch(apiUrl("/api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password: loginPassword,
          tempPassword: loginPassword,
        }),
      });

      const data = (await res.json().catch(() => null)) as BackendLoginEnvelope | null;

      const parsed = res.ok ? parseBackendLogin(data) : null;
      if (res.ok && parsed) {
        const token = await signToken(
          {
            userId: parsed.userId ?? trimmedEmail,
            email: trimmedEmail,
            ...(parsed.tenantId != null && parsed.tenantId !== ""
              ? { tenantId: parsed.tenantId }
              : {}),
          },
          { rememberMe }
        );
        await setAuthCookie(token, { rememberMe });
        return nextJsonSuccess(
          200,
          { firstLogin: parsed.firstLogin },
          parsed.message ?? "Login successful",
          parsed.reason ?? "Authenticated against the application database."
        );
      }

      if (!res.ok && data && typeof data === "object" && "success" in data && data.success === false) {
        return NextResponse.json(data, { status: res.status });
      }
    } catch {
      backendFailed = true;
    }

    if (!mockLoginEnabled()) {
      return nextJsonError(
        backendFailed ? 503 : 502,
        backendFailed ? "UPSTREAM_UNREACHABLE" : "UPSTREAM_INVALID_RESPONSE",
        "Authentication service unavailable",
        "The application database login service could not complete the request."
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
    await setAuthCookie(token, { rememberMe });

    return nextJsonSuccess(
      200,
      { firstLogin: false },
      "Login successful",
      "Authenticated against local demo user store (no temporary password on this path)."
    );
  } catch (error) {
    console.error("Login error:", error);
    const r = error instanceof Error ? error.message : "Internal server error during login.";
    return nextJsonError(500, "INTERNAL_ERROR", "Login failed", r);
  }
}
