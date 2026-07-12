import type { ProviderCtx } from '../provider'
import type { RedditPost } from './wire'

const MAINTAINERS = new Set(['autolovepon', 'shadoxfix'])

function matchesEpisode(p: RedditPost, name: string, episode: number): boolean {
  const title = (p.title ?? '').toLowerCase()
  const author = (p.author ?? '').toLowerCase()
  return (
    MAINTAINERS.has(author) &&
    title.includes(name.toLowerCase()) &&
    title.includes('episode') &&
    title.includes(String(episode))
  )
}

function extractPosts(listing: any): RedditPost[] {
  const children = listing?.data?.children
  if (!Array.isArray(children)) return []
  return children.map((c: any) => c.data as RedditPost)
}

/** Bearer-first r/anime search; public-host fallback. Maintainer + title filter preserved. */
export async function searchRedditDiscussion(ctx: ProviderCtx, animeName: string, episode: number): Promise<RedditPost[]> {
  const q = `${animeName} - Episode ${episode} discussion`
  const query = new URLSearchParams({ q, restrict_sr: 'true', sort: 'relevance', t: 'all', type: 'link', limit: '10', raw_json: '1' })

  let listing: any = null
  try {
    listing = await ctx.request.json(`${ctx.endpoints.reddit}/r/anime/search.json?${query.toString()}`, { platform: 'reddit' })
  } catch (e) {
    ctx.log.warn('[reddit] authed search failed, trying public', e)
  }
  if (!listing) {
    const pubQuery = new URLSearchParams({ q, restrict_sr: '1', sort: 'relevance', t: 'all', type: 'link', limit: '100', raw_json: '1' })
    try {
      listing = await ctx.request.json(`${ctx.endpoints.redditPublic}/r/anime/search.json?${pubQuery.toString()}`)
    } catch (e) {
      ctx.log.warn('[reddit] public search failed', e)
      return []
    }
  }
  return extractPosts(listing).filter((p) => matchesEpisode(p, animeName, episode))
}
