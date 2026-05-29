/**
 * Backward-compatible re-exports. Prefer `@/lib/location-data` in new code.
 */

export type { LocationOption as CountryOption } from "@/lib/location-data";

export {
  getAllCountryOptions,
  countryLabelFromCode,
  countryOptionsWithFallback,
  dialForCountryIso,
} from "@/lib/location-data";

import { getAllCountryOptions, dialForCountryIso as dialIso } from "@/lib/location-data";

/** @deprecated Use `getAllCountryOptions()` — returns all world countries. */
export const TEMPLE_COUNTRY_OPTIONS = getAllCountryOptions();

export function dialForCountry(iso: string): string {
  return dialIso(iso);
}
