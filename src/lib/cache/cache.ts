/**
 * Sistema de cache de dos niveles.
 *
 * L1 — Memoria (Map con TTL): SIEMPRE activo, gratis, rapido.
 * L2 — Redis (Upstash): OPCIONAL, se activa si UPSTASH_REDIS_REST_URL esta configurado.
 *
 * Uso:
 * const data = await cached("key", () => fetchData(), 300);
 */

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

// L1: Cache en memoria (Map con TTL)
const memoryCache = new Map<string, CacheEntry>();

// L2: Redis (lazy load para evitar error si no esta configurado)
let redisClient: import("@upstash/redis").Redis | null = null;

async function getRedis() {
  if (redisClient) return redisClient;
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  try {
    const { Redis } = await import("@upstash/redis");
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return redisClient;
  } catch {
    return null;
  }
}

/**
 * Obtiene un valor del cache o lo calcula si no existe.
 *
 * @param key - Clave del cache (usar helpers de keys.ts)
 * @param fn - Funcion que calcula el valor si no esta en cache
 * @param ttlSeconds - Tiempo de vida en segundos (default: 300 = 5 min)
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // 1. Buscar en L1 (memoria)
  const memEntry = memoryCache.get(key);
  if (memEntry && memEntry.expiresAt > Date.now()) {
    return memEntry.data as T;
  }

  // 2. Buscar en L2 (Redis) si esta disponible
  const redis = await getRedis();
  if (redis) {
    try {
      const cached = await redis.get<T>(key);
      if (cached !== null) {
        // Guardar en L1 para proximas requests
        memoryCache.set(key, { data: cached, expiresAt: Date.now() + ttlSeconds * 1000 });
        return cached;
      }
    } catch {
      // Redis no disponible, continuar sin cache L2
    }
  }

  // 3. Calcular valor fresco
  const fresh = await fn();

  // 4. Guardar en L1
  memoryCache.set(key, { data: fresh, expiresAt: Date.now() + ttlSeconds * 1000 });

  // 5. Guardar en L2 si esta disponible
  if (redis) {
    try {
      await redis.set(key, fresh, { ex: ttlSeconds });
    } catch {
      // Ignorar errores de Redis
    }
  }

  return fresh;
}

/**
 * Invalida una clave especifica del cache (L1 + L2)
 */
export async function invalidateCache(key: string): Promise<void> {
  memoryCache.delete(key);
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.del(key);
    } catch {
      // Ignorar
    }
  }
}

/**
 * Invalida todas las claves que empiezan con un prefijo
 * Util para invalidar modulos completos: invalidateCachePrefix("t:xxx:productos:")
 */
export async function invalidateCachePrefix(prefix: string): Promise<void> {
  // L1: eliminar por prefijo
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
  // L2: Redis no soporta SCAN en Upstash serverless facilmente
  // La TTL del cache manejara la expiracion
}

/** Limpia todo el cache en memoria (util para tests) */
export function clearMemoryCache(): void {
  memoryCache.clear();
}
