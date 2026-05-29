/**
 * Worldwide country / state / city data (ISO-3166) via `country-state-city`.
 * Use in super-admin and temple-admin location forms.
 */

import { City, Country, State } from "country-state-city";

export type LocationOption = { value: string; label: string };

/** Max cities in a native &lt;select&gt; before switching to text + datalist. */
export const CITY_SELECT_MAX = 500;

let countryOptionsCache: LocationOption[] | null = null;

export function getAllCountryOptions(): LocationOption[] {
  if (countryOptionsCache) return countryOptionsCache;
  countryOptionsCache = Country.getAllCountries()
    .map((c) => ({ value: c.isoCode, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
  return countryOptionsCache;
}

export function countryLabelFromCode(code: string | null | undefined): string {
  const iso = (code ?? "").trim().toUpperCase();
  if (!iso) return "—";
  return Country.getCountryByCode(iso)?.name ?? code ?? "—";
}

/** Include a stored ISO even if the dataset changes. */
export function countryOptionsWithFallback(iso: string): LocationOption[] {
  const all = getAllCountryOptions();
  const t = iso.trim().toUpperCase();
  if (!t || all.some((c) => c.value === t)) return all;
  return [...all, { value: t, label: countryLabelFromCode(t) }];
}

export function getStateOptions(countryIso: string): LocationOption[] {
  const iso = countryIso.trim().toUpperCase();
  if (!iso) return [];
  return State.getStatesOfCountry(iso)
    .map((s) => ({ value: s.isoCode, label: s.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getStateLabel(countryIso: string, stateIso: string): string {
  const iso = countryIso.trim().toUpperCase();
  const state = stateIso.trim();
  if (!iso || !state) return state;
  return State.getStateByCodeAndCountry(state, iso)?.name ?? state;
}

/** Match stored state (ISO code or legacy name) to a state option value. */
export function resolveStateIso(countryIso: string, stored: string): string {
  const t = stored.trim();
  if (!t) return "";
  const states = getStateOptions(countryIso);
  if (states.some((s) => s.value === t)) return t;
  const byName = states.find((s) => s.label.toLowerCase() === t.toLowerCase());
  return byName?.value ?? t;
}

export function getCityOptions(countryIso: string, stateIso?: string): LocationOption[] {
  const iso = countryIso.trim().toUpperCase();
  if (!iso) return [];
  const state = (stateIso ?? "").trim();
  const cities = state
    ? City.getCitiesOfState(iso, state)
    : City.getCitiesOfCountry(iso);
  if (!cities?.length) return [];
  const seen = new Set<string>();
  const out: LocationOption[] = [];
  for (const c of cities) {
    const name = c.name.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push({ value: name, label: name });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

export function optionsWithFallback(options: LocationOption[], current: string): LocationOption[] {
  const t = current.trim();
  if (!t || options.some((o) => o.value === t)) return options;
  return [...options, { value: t, label: t }];
}

export function dialForCountryIso(iso: string): string {
  const c = Country.getCountryByCode(iso.trim().toUpperCase());
  if (!c?.phonecode) return "+1";
  const digits = c.phonecode.replace(/\D/g, "");
  return digits ? `+${digits}` : "+1";
}

/** Regional indicator symbol letter pair → flag emoji */
export function isoToFlagEmoji(iso: string): string {
  const t = iso.trim().toUpperCase();
  if (t.length !== 2) return "🌐";
  const cp = (ch: string) => 0x1f1e6 + ch.charCodeAt(0) - 65;
  return String.fromCodePoint(cp(t[0]!), cp(t[1]!));
}

export type PhoneDialOption = { value: string; label: string };

let phoneDialCache: PhoneDialOption[] | null = null;

/** Unique E.164 dial codes with a representative country label. */
export function getPhoneDialOptions(): PhoneDialOption[] {
  if (phoneDialCache) return phoneDialCache;
  const byDial = new Map<string, { label: string; name: string }>();
  for (const c of Country.getAllCountries()) {
    const dial = dialForCountryIso(c.isoCode);
    if (!dial || dial === "+") continue;
    const flag = isoToFlagEmoji(c.isoCode);
    const entry = { label: `${flag} ${c.name} ${dial}`, name: c.name };
    const prev = byDial.get(dial);
    if (!prev || c.name.localeCompare(prev.name) < 0) {
      byDial.set(dial, entry);
    }
  }
  phoneDialCache = Array.from(byDial.entries())
    .map(([value, { label }]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
  return phoneDialCache;
}

/** Prefer select when the city list is non-empty and not huge. */
export function shouldUseCitySelect(cityCount: number): boolean {
  return cityCount > 0 && cityCount <= CITY_SELECT_MAX;
}
