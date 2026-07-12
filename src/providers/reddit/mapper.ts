import type { ProviderCtx } from '../provider'
import type { ThreadRef } from '../../types'

export interface MapperResultEntry {
  anime_name?: string
  episodes?: Record<string, string>
  movies?: string[]
  external_sites?: { mal_id?: number | string | null; anilist_id?: number | string | null }
  mal_id?: number | string | null
  anilist_id?: number | string | null
  is_exact_match?: boolean
}
export interface MapperResponse {
  results?: MapperResultEntry[]
  matched_result?: { index?: number; is_exact_match?: boolean }
}

const REDDIT_WEB = 'https://www.reddit.com'

/** Strip season suffixes so the mapper matches the base series (ported from EXT hayami-client.ts). */
export function stripSeasonSuffix(name: string): string {
  const raw = String(name || '').trim()
  const stripped = raw
    .replace(/\s+Season\s+\d+(\s+Part\s+\d+)?/i, '')
    .replace(/\s+S\d+(\s+Part\s+\d+)?/i, '')
    .replace(/\s+Part\s+\d+/i, '')
    .trim()
  return stripped || raw
}

/** Extract a reddit base36 post id from a discussion URL (…/comments/<id>/…). */
export function redditPostIdFromUrl(url: string): string | null {
  const m = /\/comments\/([a-z0-9]+)/i.exec(url)
  return m ? m[1]! : null
}

function idMatches(entry: MapperResultEntry, malId?: number, anilistId?: number): boolean {
  const em = Number(entry.external_sites?.mal_id ?? entry.mal_id)
  const ea = Number(entry.external_sites?.anilist_id ?? entry.anilist_id)
  if (malId && Number.isFinite(em) && em === malId) return true
  if (anilistId && Number.isFinite(ea) && ea === anilistId) return true
  return false
}

function orderedCandidates(res: MapperResponse, malId?: number, anilistId?: number): MapperResultEntry[] {
  const entries = Array.isArray(res.results) ? res.results : []
  if (!entries.length) return []
  const ranked: MapperResultEntry[] = []
  const push = (e?: MapperResultEntry) => { if (e && !ranked.includes(e)) ranked.push(e) }
  if (malId || anilistId) for (const e of entries) if (idMatches(e, malId, anilistId)) push(e)
  const idx = res.matched_result?.index
  if (typeof idx === 'number' && entries[idx]) push(entries[idx])
  for (const e of entries) if (e.is_exact_match) push(e)
  for (const e of entries) push(e)
  return ranked
}

/**
 * Resolve a reddit episode-discussion thread via the Hayami mapper
 * (api.hayami.moe/anime/search, reddit = default platform). Returns one ThreadRef
 * for the episode, or [] on miss. Comment bodies still come from reddit itself.
 */
export async function fetchRedditThreadMap(
  ctx: ProviderCtx,
  q: { titles: string[]; episode: number; malId?: number; anilistId?: number },
): Promise<ThreadRef[]> {
  for (const title of q.titles) {
    const params = new URLSearchParams({ series_name: stripSeasonSuffix(title), page_size: '30' })
    if (q.malId) params.set('mal_id', String(q.malId))
    if (q.anilistId) params.set('anilist_id', String(q.anilistId))
    let res: MapperResponse
    try {
      res = await ctx.request.json<MapperResponse>(`${ctx.endpoints.hayamiMapper}/anime/search?${params.toString()}`)
    } catch (e) {
      ctx.log.warn('[reddit] hayami mapper failed', e)
      continue
    }
    for (const entry of orderedCandidates(res, q.malId, q.anilistId)) {
      const url = entry.episodes?.[String(q.episode)]
      if (!url) continue
      const id = redditPostIdFromUrl(url)
      if (!id) continue
      return [{ platform: 'reddit', id, url: url.startsWith('http') ? url : `${REDDIT_WEB}${url}`, episode: q.episode }]
    }
    continue
  }
  return []
}
