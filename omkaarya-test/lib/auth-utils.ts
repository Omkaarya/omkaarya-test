import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

type AuthTokenPayload = {
  userId: string;
  email: string;
  tenantId?: string;
};

/** Default browser cookie + JWT lifetime when “Remember me” is off. */
export const AUTH_SESSION_MAX_AGE_SEC = 60 * 60 * 24; // 24h

/** Cookie + JWT lifetime when super-admin enables “Remember me for 30 days”. */
export const AUTH_REMEMBER_ME_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30d

export type AuthSessionLengthOptions = {
  rememberMe?: boolean;
};

function jwtKey(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production.');
    }
    return new TextEncoder().encode('local-development-only-secret');
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: AuthTokenPayload, options?: AuthSessionLengthOptions) {
  const rememberMe = options?.rememberMe === true;
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? "30d" : "24h")
    .sign(jwtKey());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, jwtKey(), { clockTolerance: 60 });
    return payload;
  } catch {
    return null;
  }
}

function authCookieFields(token: string, options?: AuthSessionLengthOptions) {
  const rememberMe = options?.rememberMe === true;
  const maxAge = rememberMe ? AUTH_REMEMBER_ME_MAX_AGE_SEC : AUTH_SESSION_MAX_AGE_SEC;
  return {
    name: 'auth_token' as const,
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
  };
}

/** Prefer this in Route Handlers so `Set-Cookie` is bound to the returned `NextResponse`. */
export function applyAuthCookieToResponse(
  response: NextResponse,
  token: string,
  options?: AuthSessionLengthOptions
): NextResponse {
  response.cookies.set(authCookieFields(token, options));
  return response;
}

export async function setAuthCookie(token: string, options?: AuthSessionLengthOptions) {
  (await cookies()).set(authCookieFields(token, options));
}
