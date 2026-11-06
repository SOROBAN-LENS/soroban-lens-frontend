/**
 * Tiny localStorage-backed store compatible with React's
 * `useSyncExternalStore`. Storage access is wrapped so the app keeps working
 * when storage is unavailable (private mode, blocked cookies, SSR/tests).
 */
export interface PersistentStore<T> {
  get(): T
  set(next: T | ((prev: T) => T)): void
  subscribe(listener: () => void): () => void
  /** Re-reads from storage (used by tests and cross-tab sync). */
  reload(): void
}

function safeRead(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null
  } catch {
    return null
  }
}

function safeWrite(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value)
  } catch {
    // Storage full or unavailable: keep the in-memory value only.
  }
}

export function createPersistentStore<T>(
  key: string,
  fallback: () => T,
  parse: (raw: unknown) => T,
): PersistentStore<T> {
  const listeners = new Set<() => void>()

  function load(): T {
    const raw = safeRead(key)
    if (raw === null) return fallback()
    try {
      return parse(JSON.parse(raw))
    } catch {
      return fallback()
    }
  }

  let value = load()
  const emit = () => listeners.forEach((listener) => listener())

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === key) {
        value = load()
        emit()
      }
    })
  }

  return {
    get: () => value,
    set(next) {
      value = typeof next === 'function' ? (next as (prev: T) => T)(value) : next
      safeWrite(key, JSON.stringify(value))
      emit()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    reload() {
      value = load()
      emit()
    },
  }
}
