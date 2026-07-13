import type { Provider, ProviderCtx } from '../provider'
import type { DiscussionQuery, ThreadRef } from '../../types'

/**
 * "The Anime Community" (TAC) — embed-only provider. Given the anime ids +
 * episode it builds the hayami.moe/embed/tac iframe URL; the comment UI lives
 * inside that widget (resolve-only, no getComments). Resolve makes no network call.
 */
export const animecommunityProvider: Provider = {
  platforms: ['animecommunity'],

  async resolve(q: DiscussionQuery, ctx: ProviderCtx): Promise<ThreadRef[]> {
    const hasId = (q.malId != null && q.malId > 0) || (q.anilistId != null && q.anilistId > 0)
    const episode = typeof q.episode === 'number' ? q.episode : null
    if (!hasId || episode == null) return []
    const cfg = {
      MAL_ID: q.malId ?? '',
      AniList_ID: q.anilistId ?? '',
      episodeChapterNumber: episode,
      mediaType: 'anime',
    }
    const u = new URL(ctx.endpoints.tacEmbed)
    u.searchParams.set('config', JSON.stringify(cfg))
    return [{
      platform: 'animecommunity',
      id: `tac:${q.malId ?? ''}:${q.anilistId ?? ''}:${episode}`,
      embedUrl: u.toString(),
      episode,
    }]
  },

  capabilities: () => ({ comment: false, edit: false, delete: false, vote: false, downvote: false }),
}
