// /lib/draft-storage.ts

/**
 * Draft storage helper for auto-save and resume
 * Works in the browser using localStorage
 */

export type DraftData = Record<string, any>;

// Default storage prefix to avoid collisions
const STORAGE_PREFIX = "form-draft:";

/**
 * Save draft data to localStorage
 * @param key Unique draft key (e.g., 'registration-form')
 * @param data The form state to store
 */
export function saveDraft(key: string, data: DraftData) {
  if (typeof window === "undefined") return; // SSR-safe
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save draft", err);
  }
}

/**
 * Load draft data from localStorage
 * @param key Unique draft key (e.g., 'registration-form')
 * @returns Parsed draft data or null if not found
 */
export function loadDraft<T extends DraftData>(key: string): T | null {
  if (typeof window === "undefined") return null; // SSR-safe
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("Failed to load draft", err);
    return null;
  }
}

/**
 * Clear draft from localStorage
 * @param key Unique draft key
 */
export function clearDraft(key: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (err) {
    console.error("Failed to clear draft", err);
  }
}
