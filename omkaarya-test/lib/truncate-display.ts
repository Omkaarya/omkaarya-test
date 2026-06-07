/** Visible label capped at `maxLength`; full value should go in a tooltip when truncated. */
export function truncateToMaxLength(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}…`;
}

export const TEMPLE_NAME_DISPLAY_MAX = 30;
