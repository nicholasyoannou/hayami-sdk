import type { Provider, ProviderCtx } from '../provider'
import type { Comment, DiscussionQuery, ThreadRef } from '../../types'
import { anilistQuery } from './client'
import { COMMENTS_QUERY, THREADS_QUERY } from './graphql'
import { anilistCommentToComment, normalizeComment, threadToThreadRef, type AniListThread } from './normalize'

export const anilistProvider: Provider = {
  platforms: ['anilist'],

  async resolve(q: DiscussionQuery, ctx: ProviderCtx): Promise<ThreadRef[]> {
    if (q.anilistId == null || q.anilistId <= 0) return []
    let data: any
    try {
      data = await anilistQuery(ctx, THREADS_QUERY, { animeId: q.anilistId, page: 1 })
    } catch (e) {
      ctx.log.warn('[anilist] threads query failed', e)
      return []
    }
    const threads: AniListThread[] = data?.Page?.threads ?? []
    const refs = threads.map(threadToThreadRef)
    if (typeof q.episode === 'number') {
      const exact = refs.filter((r) => r.episode === q.episode || (r.episode != null && r.episodeEnd != null && q.episode! >= r.episode && q.episode! <= r.episodeEnd))
      if (exact.length) return exact
    }
    return refs
  },

  async getComments(ref: ThreadRef, ctx: ProviderCtx): Promise<Comment[]> {
    let data: any
    try {
      data = await anilistQuery(ctx, COMMENTS_QUERY, { threadId: Number(ref.id), page: 1 })
    } catch (e) {
      ctx.log.warn('[anilist] comments query failed', e)
      return []
    }
    const raw = data?.Page?.threadComments ?? []
    return raw
      .map((c: any) => normalizeComment(c))
      .filter((x: any) => x !== null)
      .map(anilistCommentToComment)
  },

  capabilities: () => ({ comment: true, edit: true, delete: false, vote: true, downvote: false }),
}

export { anilistQuery } from './client'
export * from './normalize'
