import bcrypt from "bcryptjs";

const BCRYPT_PREFIX_RE = /^\$2[aby]\$\d{2}\$/;

export function hashPasswordCredential(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function passwordCredentialMatches(stored: string | null, submitted: string): Promise<boolean> {
  if (!stored) return false;
  if (BCRYPT_PREFIX_RE.test(stored)) {
    return bcrypt.compare(submitted, stored);
  }
  return stored === submitted;
}
