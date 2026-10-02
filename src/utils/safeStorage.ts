/**
 * Safe LocalStorage wrapper with auto-recovery for QuotaExceededError.
 */

export const safeStorage = {
  get<T>(key: string, fallback: T): T {
    try {
      if (typeof window === 'undefined') return fallback;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err: any) {
      console.warn(`LocalStorage set failed for key ${key}:`, err);
      // If quota exceeded, attempt to prune old temporary items
      try {
        if (err?.name === 'QuotaExceededError' || err?.code === 22) {
          // Clear large caches or trim lists
          const looksStr = localStorage.getItem('ayna_saved_looks');
          if (looksStr) {
            const parsed = JSON.parse(looksStr);
            if (Array.isArray(parsed) && parsed.length > 5) {
              localStorage.setItem('ayna_saved_looks', JSON.stringify(parsed.slice(0, 5)));
              localStorage.setItem(key, JSON.stringify(value));
              return true;
            }
          }
        }
      } catch {
        // Silent failover
      }
      return false;
    }
  },

  remove(key: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
  },
};
