import type { CacheAdapter } from '../options'

interface Entry {
  value: unknown
  expiresAt: number // Infinity = never
}

export class MemoryCache implements CacheAdapter {
  private store = new Map<string, Entry>()
  constructor(private now: () => number = () => Date.now()) {}

  async get(k: string): Promise<unknown> {
    const e = this.store.get(k)
    if (!e) return undefined
    if (e.expiresAt <= this.now()) {
      this.store.delete(k)
      return undefined
    }
    return e.value
  }

  async set(k: string, v: unknown, ttlMs?: number): Promise<void> {
    this.store.set(k, { value: v, expiresAt: ttlMs !== undefined ? this.now() + ttlMs : Infinity })
  }
}
