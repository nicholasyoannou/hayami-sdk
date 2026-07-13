import type { Platform } from './types'

export interface RequesterResponse {
  ok: boolean
  status: number
  headers: Record<string, string>
  text(): Promise<string>
  json(): Promise<unknown>
}

export interface HttpAdapter {
  (url: string, init?: {
    method?: string
    headers?: Record<string, string>
    body?: string
  }): Promise<RequesterResponse>
}

export interface Endpoints {
  mapper: string // discussanime (forum/disqus resolve + catalog)
  reddit: string
  redditPublic: string
  anilist: string
  jikan: string
  mal: string
  youtube: string
  hayamiMapper: string // api.hayami.moe — Hayami mapper: reddit (default) / youtube (platform=youtube) / aniwave
}

export const DEFAULT_ENDPOINTS: Endpoints = {
  mapper: 'https://discussanime.moe',
  reddit: 'https://oauth.reddit.com',
  redditPublic: 'https://www.reddit.com',
  anilist: 'https://graphql.anilist.co',
  jikan: 'https://api.jikan.moe/v4',
  mal: 'https://api.myanimelist.net/v2',
  youtube: 'https://www.googleapis.com/youtube/v3',
  hayamiMapper: 'https://api.hayami.moe',
}

export interface CacheAdapter {
  get(k: string): Promise<unknown>
  set(k: string, v: unknown, ttlMs?: number): Promise<void>
}

export interface Logger {
  debug(...a: unknown[]): void
  warn(...a: unknown[]): void
  error(...a: unknown[]): void
}

export interface DiscussionClientOptions {
  http: HttpAdapter
  mapperBaseUrl?: string
  endpoints?: Partial<Endpoints>
  getToken?(p: Platform): string | undefined | Promise<string | undefined>
  youtubeApiKey?: string
  cache?: CacheAdapter
  logger?: Logger
  defaultTimeoutMs?: number
}

export function resolveEndpoints(
  o: Pick<DiscussionClientOptions, 'mapperBaseUrl' | 'endpoints'>,
): Endpoints {
  const merged: Endpoints = { ...DEFAULT_ENDPOINTS, ...(o.endpoints ?? {}) }
  if (o.mapperBaseUrl && !o.endpoints?.mapper) merged.mapper = o.mapperBaseUrl
  return merged
}
