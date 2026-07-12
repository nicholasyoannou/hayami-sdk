import type { ProviderCtx } from '../provider'
import type { MalForumPost, MalForumTopic } from './wire'

/** Unauth Jikan topic discovery. Maps Jikan forum entries → MalForumTopic[]. */
export async function fetchJikanForumTopics(ctx: ProviderCtx, malId: number): Promise<MalForumTopic[]> {
  if (!Number.isFinite(malId) || malId <= 0) return []
  let body: any
  try {
    body = await ctx.request.json(`${ctx.endpoints.jikan}/anime/${malId}/forum`)
  } catch (e) {
    ctx.log.warn('[mal] jikan forum failed', e)
    return []
  }
  const data = Array.isArray(body?.data) ? body.data : []
  return data.map((row: any): MalForumTopic => ({
    id: row.mal_id ?? row.id ?? 'unknown',
    title: row.title ?? 'Untitled',
    created_at: row.date,
    author: { name: row.author_username },
    comments: row.comments,
    last_post: { created_at: row.last_comment?.date },
    url: row.url,
    source: 'jikan',
  }))
}

/** AUTH (getToken('mal')). Returns [] with a warn when no MAL token. */
export async function fetchMalTopicPosts(ctx: ProviderCtx, topicId: number | string): Promise<MalForumPost[]> {
  const token = ctx.getToken ? await ctx.getToken('mal') : undefined
  if (!token) {
    ctx.log.warn('[mal] no token; MAL topic posts require getToken("mal")')
    return []
  }
  let body: any
  try {
    body = await ctx.request.json(`${ctx.endpoints.mal}/forum/topic/${topicId}?fields=id,created_at,author,body`, { platform: 'mal' })
  } catch (e) {
    ctx.log.warn('[mal] topic posts failed', e)
    return []
  }
  const posts = Array.isArray(body?.data?.posts) ? body.data.posts : []
  return posts.map((p: any): MalForumPost => {
    const author = p.author ?? (p.created_by ? { id: p.created_by.id, name: p.created_by.name, forum_title: p.created_by.forum_title, forum_avatar: p.created_by.forum_avator ?? p.created_by.forum_avatar } : undefined)
    return { id: p.id ?? 'unknown', created_at: p.created_at, author, body: p.body, signature: p.signature }
  })
}
