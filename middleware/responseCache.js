const cacheStore = new Map();

const buildCacheKey = (req) => `${req.method}:${req.originalUrl}`;

const cacheGetUsers = (ttlMs = 30 * 1000) => (req, res, next) => {
  if (req.method !== 'GET') {
    next();
    return;
  }

  const key = buildCacheKey(req);
  const cached = cacheStore.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    res.set('X-Cache', 'HIT');
    res.status(cached.statusCode).json(cached.payload);
    return;
  }

  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    cacheStore.set(key, {
      statusCode: res.statusCode || 200,
      payload,
      expiresAt: Date.now() + ttlMs
    });
    res.set('X-Cache', 'MISS');
    return originalJson(payload);
  };

  next();
};

const clearUsersCache = () => {
  for (const key of cacheStore.keys()) {
    if (key.startsWith('GET:/api/users')) {
      cacheStore.delete(key);
    }
  }
};

module.exports = {
  cacheGetUsers,
  clearUsersCache
};
