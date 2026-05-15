/** JSON snapshot helper for dirty-form detection. */
export function formSnapshot(value: unknown): string {
  return JSON.stringify(value);
}

export function isSnapshotDirty(current: string, baseline: string): boolean {
  return current !== baseline;
}
