/** Client-side card checks for onboarding UI only — does not replace a PCI-compliant processor. */

export function luhnCheck(digits: string): boolean {
  const d = digits.replace(/\D/g, "");
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i]!, 10);
    if (Number.isNaN(n)) return false;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function normalizeCardDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 19);
}

export function formatCardDigitsSpaced(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

/**
 * Display like the mock: first group + masked middle + last 4 (when long enough and not editing).
 */
export function maskCardDisplay(digits: string): string {
  if (digits.length < 13) return formatCardDigitsSpaced(digits);
  const first = digits.slice(0, 4);
  const last = digits.slice(-4);
  return `${first} •••• •••• ${last}`;
}

export type ParsedExpiry = { month: number; year: number };

export function parseExpiryDigits(digits: string): ParsedExpiry | null {
  const d = digits.replace(/\D/g, "");
  if (d.length < 4) return null;
  const month = parseInt(d.slice(0, 2), 10);
  const yearPart = d.slice(2);
  if (month < 1 || month > 12) return null;
  let year: number;
  if (yearPart.length === 2) {
    year = 2000 + parseInt(yearPart, 10);
  } else if (yearPart.length === 4) {
    year = parseInt(yearPart, 10);
  } else {
    return null;
  }
  if (year < 2000 || year > 2100) return null;
  return { month, year };
}

export function formatExpiryInput(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 6);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)} / ${d.slice(2)}`;
}

export function isExpiryNotPast(parsed: ParsedExpiry, now = new Date()): boolean {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  if (parsed.year > y) return true;
  if (parsed.year < y) return false;
  return parsed.month >= m;
}

export function isValidCvv(digits: string, cardDigitLength: number): boolean {
  const cvv = digits.replace(/\D/g, "");
  if (cardDigitLength < 13) return false;
  if (cardDigitLength === 15) return cvv.length === 4;
  return cvv.length === 3;
}

export function normalizeCvv(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

export function isCardholderNameValid(name: string): boolean {
  const t = name.trim();
  return t.length >= 2 && t.length <= 120;
}
