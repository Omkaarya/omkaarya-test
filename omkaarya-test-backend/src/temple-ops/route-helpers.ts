import { z } from "zod";

export function routeParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function optionalQueryString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function positiveQueryInt(value: unknown): number | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export const dateTimeString = z.string().min(1).refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid date/time value.",
});

export const moneyAmount = z.number().finite().nonnegative();
