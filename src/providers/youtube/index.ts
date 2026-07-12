import type { Provider, ProviderCtx } from '../provider'
import type { Comment, DiscussionQuery, ThreadRef } from '../../types'
import { findVideoInPlaylist, pickBestChannelResult } from './playlist'
import { getVideoComments } from './comments'
import { youtubeCommentToComment } from './normalize'

export const youtubeProvider: Provider = {
  platforms: ['youtube'],

  async resolve(q: DiscussionQuery, ctx: ProviderCtx): Promise<ThreadRef[]> {
    const episode = typeof q.episode === 'number' ? q.episode : null
    if (episode == null || !q.titles?.length) return []
    const base = ctx.endpoints.hayamiMapper
    const name = q.titles[0]!
    let data: any
    try {
      data = await ctx.request.json(`${base}/anime/search?series_name=${encodeURIComponent(name)}&platform=youtube`)
    } catch (e) {
      ctx.log.warn('[youtube] playlist mapper failed', e)
      return []
    }
    const playlist = pickBestChannelResult(data, name)
    const video = findVideoInPlaylist(playlist, episode)
    if (!video) return []
    return [{
      platform: 'youtube',
      id: video.video_id,
      url: `https://www.youtube.com/watch?v=${video.video_id}`,
      embedUrl: `https://www.youtube.com/embed/${video.video_id}`,
      episode,
    }]
  },

  async getComments(ref: ThreadRef, ctx: ProviderCtx): Promise<Comment[]> {
    const raw = await getVideoComments(ctx, ref.id)
    return raw.map(youtubeCommentToComment)
  },

  capabilities: () => ({ comment: false, edit: false, delete: false, vote: false, downvote: false }),
}

export { findVideoInPlaylist, pickBestChannelResult } from './playlist'
export { getVideoComments } from './comments'
export * from './wire'
