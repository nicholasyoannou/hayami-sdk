import type { Provider, ProviderCtx } from '../provider'
import type { Comment, DiscussionQuery, ThreadRef } from '../../types'
import { searchRedditDiscussion } from './search'
import { getPostComments } from './comments'
import { postToThreadRef, redditCommentToComment } from './normalize'

export const redditProvider: Provider = {
  platforms: ['reddit'],

  async resolve(q: DiscussionQuery, ctx: ProviderCtx): Promise<ThreadRef[]> {
    const episode = typeof q.episode === 'number' ? q.episode : null
    if (episode == null || !q.titles?.length) return []
    const refs: ThreadRef[] = []
    const seen = new Set<string>()
    for (const title of q.titles) {
      const posts = await searchRedditDiscussion(ctx, title, episode)
      for (const p of posts) {
        if (seen.has(p.id)) continue
        seen.add(p.id)
        refs.push(postToThreadRef(p, episode))
      }
    }
    return refs
  },

  async getComments(ref: ThreadRef, ctx: ProviderCtx): Promise<Comment[]> {
    const res = await getPostComments(ctx, ref.id)
    return res.comments.map(redditCommentToComment)
  },

  capabilities: () => ({ comment: true, edit: true, delete: true, vote: true, downvote: true }),
}

export { parseComments } from './parse'
export { getPostComments } from './comments'
export { searchRedditDiscussion } from './search'
export * from './wire'
