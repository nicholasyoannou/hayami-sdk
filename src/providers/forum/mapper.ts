import type { ProviderCtx } from '../provider'
import { byAnimeUrl, type AnimeThreadRow, type ByAnimeResponse } from './wire'

const LIMIT = 50
const MAX_PAGES = 4

/** Ported from EXT findEpisodeThread page loop: hint → break after page 1; else walk up to 4 pages. */
export async function fetchThreadsByAnime(
  ctx: ProviderCtx,
  q: { malId?: number | null; anilistId?: number | null; episodeHint?: number | null },
): Promise<AnimeThreadRow[]> {
  const rows: AnimeThreadRow[] = []
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = byAnimeUrl(ctx.endpoints.mapper, { ...q, limit: LIMIT, page })
    if (!url) return rows
    let body: ByAnimeResponse
    try {
      body = await ctx.request.json<ByAnimeResponse>(url)
    } catch (e) {
      ctx.log.warn('[forum] by-anime failed', e)
      break
    }
    const pageThreads = Array.isArray(body?.threads) ? body.threads : []
    rows.push(...pageThreads)
    if (!body?.has_more || pageThreads.length === 0) break
    if (q.episodeHint != null && q.episodeHint > 0) break
  }
  return rows
}
