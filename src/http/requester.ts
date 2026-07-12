import type { CacheAdapter, HttpAdapter, Logger, RequesterResponse } from '../options'
import type { Platform } from '../types'
import { HttpError, AuthRequiredError, RateLimitedError, TimeoutError } from './errors'

export interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: string
  platform?: Platform
  auth?: boolean // require a token; throw AuthRequiredError if getToken yields none
  cacheKey?: string
  cacheTtlMs?: number
  timeoutMs?: number
}

export interface Requester {
  request(url: string, opts?: RequestOptions): Promise<RequesterResponse>
  json<T = unknown>(url: string, opts?: RequestOptions): Promise<T>
}

interface CachedBody {
  status: number
  headers: Record<string, string>
  body: string
}

const noopLogger: Logger = { debug() {}, warn() {}, error() {} }

export function createRequester(o: {
  http: HttpAdapter
  getToken?(p: Platform): string | undefined | Promise<string | undefined>
  cache?: CacheAdapter
  logger?: Logger
  defaultTimeoutMs?: number
}): Requester {
  const log = o.logger ?? noopLogger
  const defaultTimeout = o.defaultTimeoutMs ?? 15000

  async function request(url: string, opts: RequestOptions = {}): Promise<RequesterResponse> {
    const method = opts.method ?? 'GET'
    const headers: Record<string, string> = { ...(opts.headers ?? {}) }

    if (opts.auth && !opts.platform) throw new Error('requester: auth requires a platform')

    let token: string | undefined
    if (opts.platform && o.getToken) token = await o.getToken(opts.platform)
    if (opts.auth && !token) throw new AuthRequiredError(opts.platform!)
    if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`

    const cacheKey =
      method === 'GET' && o.cache ? (opts.cacheKey ?? `${method}\n${url}\n${opts.body ?? ''}`) : undefined
    if (cacheKey) {
      const hit = (await o.cache!.get(cacheKey)) as CachedBody | undefined
      if (hit) return toResponse(hit)
    }

    const res = await withTimeout(
      o.http(url, { method, headers, body: opts.body }),
      opts.timeoutMs ?? defaultTimeout,
      url,
    )

    if (cacheKey && res.ok) {
      const body = await res.text()
      const snapshot: CachedBody = { status: res.status, headers: res.headers, body }
      await o.cache!.set(cacheKey, snapshot, opts.cacheTtlMs)
      return toResponse(snapshot)
    }
    return res
  }

  async function json<T = unknown>(url: string, opts: RequestOptions = {}): Promise<T> {
    const res = await request(url, opts)
    if (!res.ok) {
      if (res.status === 429) {
        throw new RateLimitedError(`rate limited: ${url}`, 429, url, parseRetryAfter(res.headers))
      }
      throw new HttpError(`HTTP ${res.status}: ${url}`, res.status, url)
    }
    return (await res.json()) as T
  }

  return { request, json }

  function toResponse(c: CachedBody): RequesterResponse {
    return {
      ok: c.status >= 200 && c.status < 300,
      status: c.status,
      headers: c.headers,
      text: async () => c.body,
      json: async () => (c.body ? JSON.parse(c.body) : null),
    }
  }

  async function withTimeout(p: Promise<RequesterResponse>, ms: number, url: string) {
    let t: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_, reject) => {
      t = setTimeout(() => reject(new TimeoutError(url, ms)), ms)
    })
    try {
      return await Promise.race([p, timeout])
    } finally {
      if (t) clearTimeout(t)
      log.debug('[requester]', url)
    }
  }
}

function parseRetryAfter(headers: Record<string, string>): number | undefined {
  const raw = headers['retry-after'] ?? headers['Retry-After']
  if (!raw) return undefined
  const secs = Number(raw)
  return Number.isFinite(secs) ? secs * 1000 : undefined
}
