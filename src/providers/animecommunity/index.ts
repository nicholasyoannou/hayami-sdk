import type { Provider, ProviderCtx } from '../provider'
import type { DiscussionQuery, ThreadRef } from '../../types'

/**
 * "The Anime Community" (TAC) — resolve-only. TAC is a script embed
 * (theanimecommunity.com/embed.js) driven by a global `theAnimeCommunityConfig`
 * object the consumer sets before loading the script, so resolve returns a
 * scriptEmbed descriptor (no iframe URL, no network). Mounting the script and
 * setting the global is the consumer's responsibility, not the SDK's.
 */
export const animecommunityProvider: Provider = {
  platforms: ['animecommunity'],

  async resolve(q: DiscussionQuery, ctx: ProviderCtx): Promise<ThreadRef[]> {
    const hasMal = q.malId != null && q.malId > 0
    const hasAniList = q.anilistId != null && q.anilistId > 0
    const episode = typeof q.episode === 'number' ? q.episode : null
    if ((!hasMal && !hasAniList) || episode == null) return []

    const config: Record<string, string | number> = {
      episodeChapterNumber: episode,
      mediaType: 'anime',
    }
    if (hasMal) config.MAL_ID = q.malId!
    if (hasAniList) config.AniList_ID = q.anilistId!

    return [{
      platform: 'animecommunity',
      id: `tac:${q.malId ?? ''}:${q.anilistId ?? ''}:${episode}`,
      episode,
      scriptEmbed: {
        scriptSrc: ctx.endpoints.tacScript,
        scriptId: 'anime-community-script',
        containerId: 'anime-community-comment-section',
        configVar: 'theAnimeCommunityConfig',
        config,
      },
    }]
  },

  capabilities: () => ({ comment: false, edit: false, delete: false, vote: false, downvote: false }),
}
