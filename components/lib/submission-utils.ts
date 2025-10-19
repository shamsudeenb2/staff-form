// lib/submission-utils.ts
import { differenceInYears } from "date-fns";

/**
 * computeDiff(oldObj, newObj) -> { added, removed, changed }
 * - uses dot-path notation for changed keys; also returns full objects for changed keys
 */
export function computeDiff(oldObj: any = {}, newObj: any = {}) {
  const added: Record<string, any> = {};
  const removed: Record<string, any> = {};
  const changed: Record<string, { from: any; to: any }> = {};

  function walk(path: string[], a: any, b: any) {
    const keys = new Set<string | number>([
      ...Object.keys(a ?? {}),
      ...Object.keys(b ?? {}),
    ]);

    for (const k of keys) {
      const pa = a?.[k];
      const pb = b?.[k];
      const newPath = [...path, String(k)];
      const pathKey = newPath.join(".");

      const bothObjects =
        pa != null &&
        pb != null &&
        typeof pa === "object" &&
        typeof pb === "object" &&
        !Array.isArray(pa) &&
        !Array.isArray(pb);

      if (bothObjects) {
        walk(newPath, pa, pb);
        continue;
      }

      if (pa === undefined && pb !== undefined) {
        added[pathKey] = pb;
        continue;
      }
      if (pa !== undefined && pb === undefined) {
        removed[pathKey] = pa;
        continue;
      }
      // value changed (strict inequality)
      // for array/object shallow compare by JSON string (safe for most typed content)
      const paStr = typeof pa === "object" ? JSON.stringify(pa) : pa;
      const pbStr = typeof pb === "object" ? JSON.stringify(pb) : pb;
      if (paStr !== pbStr) {
        changed[pathKey] = { from: pa, to: pb };
      }
    }
  }

  walk([], oldObj ?? {}, newObj ?? {});
  return { added, removed, changed };
}

/** helper to compute years in service (for future use) */
export function calculateYearsSince(dateIso?: string | null) {
  if (!dateIso) return 0;
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return 0;
  const now = new Date();
  if (d > now) return 0;
  // full years
  return differenceInYears(now, d);
}
