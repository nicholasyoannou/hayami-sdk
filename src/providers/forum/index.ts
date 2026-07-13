import type { Provider, ProviderCtx } from '../provider'
import type { DiscussionQuery, ThreadRef } from '../../types'
import { fetchThreadsByAnime } from './mapper'
import { matchEpisodeThread } from './match'
import { rowToThreadRef } from './normalize'

export const forumProvider: Provider = {
  platforms: ['forum', 'disqus'],

  async resolve(q: DiscussionQuery, ctx: ProviderCtx): Promise<ThreadRef[]> {
    const hasId = (q.malId != null && q.malId > 0) || (q.anilistId != null && q.anilistId > 0)
    if (!hasId) return []
    const episodeHint = typeof q.episode === 'number' && q.episode > 0 ? q.episode : null
    const rows = await fetchThreadsByAnime(ctx, { malId: q.malId, anilistId: q.anilistId, episodeHint })
    const hit = matchEpisodeThread(rows, {
      episodeCandidates: [q.episode],
      isMovie: q.isMovie,
    })
    if (!hit) return []
    const ref = rowToThreadRef(hit)
    if (ref.platform === 'disqus' && ctx.disqusEmbed) {
      ref.embedUrl = ctx.disqusEmbed({
        forumShortname: hit.forum_shortname,
        identifier: String(hit.identifier),
        url: hit.url,
        title: hit.title,
        malId: q.malId,
        anilistId: q.anilistId,
        episode: typeof q.episode === 'number' ? q.episode : undefined,
      })
    }
    return [ref]
  },

  capabilities: () => ({ comment: false, edit: false, delete: false, vote: false, downvote: false }),
}

export * from './wire'
export { matchEpisodeThread } from './match'
export { rowToThreadRef, lookupRowToThreadRef } from './normalize'
