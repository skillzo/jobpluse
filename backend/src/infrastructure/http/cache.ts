import { LRUCache } from "lru-cache";
import { createHash } from "crypto";

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  max?: number; // Maximum number of items
}

export class CacheService {
  private cache: LRUCache<string, { data: any; timestamp: number }>;

  constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache({
      max: options.max || 1000,
      ttl: options.ttl || 60000, // Default 1 minute
      updateAgeOnGet: true,
      allowStale: false,
    });
  }

  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);

    const paramString = JSON.stringify(sortedParams);
    const hash = createHash("md5")
      .update(`${prefix}:${paramString}`)
      .digest("hex");
    return `${prefix}:${hash}`;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > (this.cache.ttl || 60000)) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(
      key,
      {
        data,
        timestamp: Date.now(),
      },
      { ttl }
    );
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; max: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      max: this.cache.max,
      hits: this.cache.hits,
      misses: this.cache.misses,
    };
  }
}

// Create cache instances for different purposes
export const apiCache = new CacheService({ ttl: 60000, max: 1000 }); // 1 minute TTL
export const analyticsCache = new CacheService({ ttl: 300000, max: 500 }); // 5 minutes TTL
