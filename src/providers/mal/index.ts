import type { Provider, ProviderCtx } from '../provider'
import type { Comment, DiscussionQuery, ThreadRef } from '../../types'
import { fetchJikanForumTopics, fetchMalTopicPosts } from './fetch'
import { pickEpisodeTopic } from './pick'
import { malPostToComment, topicToThreadRef } from './normalize'

export const malProvider: Provider = {
  platforms: ['mal'],

  async resolve(q: DiscussionQuery, ctx: ProviderCtx): Promise<ThreadRef[]> {
    let malId = q.malId
    if ((malId == null || malId <= 0) && q.titles?.length) {
      malId = (await searchJikanAnimeId(ctx, q.titles[0]!)) ?? undefined
    }
    if (malId == null || malId <= 0) return []
    const topics = await fetchJikanForumTopics(ctx, malId)
    const episode = typeof q.episode === 'number' ? q.episode : undefined
    const topic = pickEpisodeTopic(topics, episode)
    return topic ? [topicToThreadRef(topic)] : []
  },

  async getComments(ref: ThreadRef, ctx: ProviderCtx): Promise<Comment[]> {
    const posts = await fetchMalTopicPosts(ctx, ref.id)
    return posts.map(malPostToComment)
  },

  capabilities: () => ({ comment: false, edit: false, delete: false, vote: false, downvote: false }),
}

async function searchJikanAnimeId(ctx: ProviderCtx, name: string): Promise<number | null> {
  try {
    const body = await ctx.request.json<any>(`${ctx.endpoints.jikan}/anime?q=${encodeURIComponent(name)}&limit=1&type=tv`)
    const id = body?.data?.[0]?.mal_id
    return typeof id === 'number' ? id : null
  } catch {
    return null
  }
}

export { fetchJikanForumTopics, fetchMalTopicPosts } from './fetch'
export * from './wire'
