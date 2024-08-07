import Elysia from "elysia";

class LRUCache {
  private cache: Map<string, { value: any; expiredAt: number }> = new Map();
  private capacity: number;
  private ttl: number;

  constructor(capacity: number, ttl: number) {
    this.capacity = capacity;
    this.ttl = ttl;
    setInterval(() => this.cleanup(), Math.min(this.ttl / 2, 1000));
  }

  private isExpired(expiredAt: number): boolean {
    return Date.now() > expiredAt;
  }

  private cleanup() {
    for (const [key, { expiredAt }] of this.cache) {
      if (this.isExpired(expiredAt)) {
        this.cache.delete(key);
      }
    }
  }

  get<T>(key: string): T | null {
    if (this.cache.has(key)) {
      const { value, expiredAt } = this.cache.get(key)!;
      if (this.isExpired(expiredAt)) {
        this.cache.delete(key);
        return null;
      }
      const newExpiredAt = Date.now() + this.ttl;
      this.cache.delete(key);
      this.cache.set(key, { value, expiredAt: newExpiredAt });
      return value as T;
    }
    return null;
  }

  set<T>(key: string, value: T) {
    const expiredAt = Date.now() + this.ttl;
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, expiredAt });
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  has(key: string): boolean {
    if (this.cache.has(key)) {
      const { expiredAt } = this.cache.get(key)!;
      if (this.isExpired(expiredAt)) {
        this.cache.delete(key);
        return false;
      }
      return true;
    }
    return false;
  }

}

export const CacheService = (capacity: number, ttl: number) => {
  const cache = new LRUCache(capacity, ttl);

  return new Elysia({
    name: "CacheService",
  }).derive({ as: "scoped" }, () => ({
    cache,
  }));
};
