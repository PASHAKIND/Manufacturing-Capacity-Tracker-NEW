const cache = new Map<string, { data: any, timestamp: number }>();
// Set a short cache duration. This is for session-based caching, not long-term storage.
// 5 minutes is reasonable.
const CACHE_DURATION_MS = 5 * 60 * 1000; 

export const cacheService = {
  get: <T>(key: string): T | undefined => {
    const item = cache.get(key);
    if (item && (Date.now() - item.timestamp < CACHE_DURATION_MS)) {
      // Return a deep copy to prevent mutations of the cached object
      try {
        return JSON.parse(JSON.stringify(item.data)) as T;
      } catch (e) {
        console.error("Failed to deep copy from cache", e);
        // if copy fails, return original and log error
        return item.data as T;
      }
    }
    if (item) {
        // Cache expired
        cache.delete(key);
    }
    return undefined;
  },

  set: <T>(key:string, data: T): void => {
    try {
        // Store a deep copy to prevent mutations of the original object affecting the cache
        const copy = JSON.parse(JSON.stringify(data));
        cache.set(key, { data: copy, timestamp: Date.now() });
    } catch(e) {
        console.error("Failed to deep copy to cache", e);
        // If copy fails, store original object
        cache.set(key, { data, timestamp: Date.now() });
    }
  },
  
  invalidate: (prefix: string): void => {
    const keysToDelete: string[] = [];
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => cache.delete(key));
  },
  
  clearAll: (): void => {
      cache.clear();
  }
};
