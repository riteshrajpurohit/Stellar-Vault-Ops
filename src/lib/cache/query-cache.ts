type Subscriber = () => void;

interface CacheEntry<T> {
  value: T;
  updatedAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const subscribers = new Map<string, Set<Subscriber>>();

function notify(key: string) {
  const listeners = subscribers.get(key);
  if (!listeners) {
    return;
  }

  for (const listener of listeners) {
    listener();
  }
}

function storageKey(key: string) {
  return `svo-cache:${key}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function jsonReplacer(_key: string, value: unknown) {
  if (typeof value === "bigint") {
    return { __type: "bigint", value: value.toString() };
  }

  return value;
}

function jsonReviver(_key: string, value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "__type" in value &&
    (value as { __type?: string }).__type === "bigint" &&
    "value" in value
  ) {
    return BigInt((value as { value: string }).value);
  }

  return value;
}

export function readCache<T>(key: string): CacheEntry<T> | null {
  const inMemory = cache.get(key) as CacheEntry<T> | undefined;
  if (inMemory) {
    return inMemory;
  }

  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey(key));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw, jsonReviver) as CacheEntry<T>;
    cache.set(key, parsed);
    return parsed;
  } catch {
    window.localStorage.removeItem(storageKey(key));
    return null;
  }
}

export function writeCache<T>(key: string, value: T) {
  const entry: CacheEntry<T> = {
    value,
    updatedAt: Date.now(),
  };

  cache.set(key, entry);

  if (canUseStorage()) {
    window.localStorage.setItem(
      storageKey(key),
      JSON.stringify(entry, jsonReplacer),
    );
  }

  notify(key);
}

export function invalidateCache(key: string) {
  cache.delete(key);
  if (canUseStorage()) {
    window.localStorage.removeItem(storageKey(key));
  }
  notify(key);
}

export function subscribeCache(key: string, listener: Subscriber) {
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());
  }

  subscribers.get(key)?.add(listener);

  return () => {
    subscribers.get(key)?.delete(listener);
  };
}

export function isCacheFresh(updatedAt: number, maxAgeMs: number) {
  return Date.now() - updatedAt <= maxAgeMs;
}
