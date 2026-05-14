import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

type AuthTokenPayload = {
  userId: string;
  email: string;
  tenantId?: string;
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

export async function signToken(payload: AuthTokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(jwtKey());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, jwtKey());
    return payload;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
  });
}
