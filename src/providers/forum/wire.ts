export interface AnimeThreadRow {
  id: number
  slug: string
  title: string
  episode_number: number | null
  episode_number_end: number | null
  comment_count: number
  created_at: number
  identifier: string
  url: string
  forum_shortname: string
  is_embed?: 0 | 1
  embed_url?: string | null
}

export interface ByAnimeResponse {
  threads: AnimeThreadRow[]
  has_more?: boolean
  page?: number
}

export interface LookupThreadRow {
  id: number
  slug: string
  title: string
  identifier: string
  url: string
  forum_shortname: string
  is_embed?: 0 | 1
  embed_url?: string | null
}

export interface LookupThreadResponse {
  thread: LookupThreadRow | null
}

export const BY_ANIME_EPISODE_WINDOW = 30

export function lookupUrl(
  base: string,
  q: { malId?: number | null; anilistId?: number | null; episodeNumber?: number | null; episodeNumberEnd?: number | null; isMovie?: boolean },
): string | null {
  const p = new URLSearchParams()
  if (q.malId != null && q.malId > 0) p.set('mal_id', String(q.malId))
  else if (q.anilistId != null && q.anilistId > 0) p.set('anilist_id', String(q.anilistId))
  else return null
  if (q.isMovie) p.set('movie', '1')
  else if (q.episodeNumber != null && q.episodeNumber > 0) {
    p.set('episode_number', String(q.episodeNumber))
    if (q.episodeNumberEnd != null && q.episodeNumberEnd > q.episodeNumber) {
      p.set('episode_number_end', String(q.episodeNumberEnd))
    }
  } else return null
  return `${base}/api/threads/lookup?${p.toString()}`
}

export function byAnimeUrl(
  base: string,
  q: { malId?: number | null; anilistId?: number | null; episodeHint?: number | null; limit: number; page: number },
): string | null {
  const p = new URLSearchParams()
  if (q.malId != null && q.malId > 0) p.set('mal_id', String(q.malId))
  else if (q.anilistId != null && q.anilistId > 0) p.set('anilist_id', String(q.anilistId))
  else return null
  if (q.episodeHint != null && q.episodeHint > 0) {
    p.set('episode', String(q.episodeHint))
    p.set('episode_window', String(BY_ANIME_EPISODE_WINDOW))
  }
  p.set('limit', String(q.limit))
  p.set('page', String(q.page))
  return `${base}/api/threads/by-anime?${p.toString()}`
}
