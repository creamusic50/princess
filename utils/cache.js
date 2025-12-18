const NodeCache = require('node-cache');

class Cache {
  constructor(ttlSeconds = 3600) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl = null) {
    if (ttl) {
      this.cache.set(key, value, ttl);
    } else {
      this.cache.set(key, value);
    }
  }

  del(keys) {
    this.cache.del(keys);
  }

  flush() {
    this.cache.flushAll();
  }

  // Cache middleware for Express
  middleware(duration) {
    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = `__express__${req.originalUrl || req.url}`;
      const cachedBody = this.get(key);

      if (cachedBody) {
        res.send(cachedBody);
        return;
      }

      // Override res.send
      res.originalSend = res.send;
      res.send = (body) => {
        this.set(key, body, duration);
        res.originalSend(body);
      };

      next();
    };
  }

  // Cache for specific routes
  async cacheRoute(key, duration, fn) {
    const cached = this.get(key);
    
    if (cached) {
      return cached;
    }

    const result = await fn();
    this.set(key, result, duration);
    return result;
  }
}

// Export the Cache class so callers can create instances with different TTLs
module.exports = Cache;

// Also export a default shared cache instance for scripts that prefer a singleton
module.exports.defaultCache = new Cache(1800); // 30 minutes default TTL