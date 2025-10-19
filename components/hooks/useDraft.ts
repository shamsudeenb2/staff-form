// components/lib/combinedDraft.ts
export type CombinedDraft = {
  personal?: any;
  education?: any;
  employment?: any;
  others?: any;
};

const isBrowser = () => typeof window !== "undefined";

/**
 * localStorage key for a user's combined draft
 */
export const draftKeyFor = (userId?: string | null) =>
  userId ? `nipost:user:${userId}:draft` : null;

export function loadCombinedDraft(userId?: string | null): CombinedDraft | null {
  if (!isBrowser() || !userId) return null;
  const key = draftKeyFor(userId);
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CombinedDraft;
  } catch (e) {
    console.warn("loadCombinedDraft parse failed:", e);
    return null;
  }
}

export function saveCombinedDraft(userId: string, patch: Partial<CombinedDraft>) {
  if (!isBrowser() || !userId) return;
  const key = draftKeyFor(userId)!;
  try {
    const existing = loadCombinedDraft(userId) || {};
    const merged = { ...existing, ...patch };
    window.localStorage.setItem(key, JSON.stringify(merged));
  } catch (e) {
    console.warn("saveCombinedDraft failed:", e);
  }
}

export function clearCombinedDraft(userId?: string | null) {
  if (!isBrowser() || !userId) return;
  const key = draftKeyFor(userId)!;
  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    console.warn("clearCombinedDraft failed:", e);
  }
}
