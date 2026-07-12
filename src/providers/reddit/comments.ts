import type { ProviderCtx } from '../provider'
import { parseComments } from './parse'
import type { RedditCommentsResult, RedditCommentSort } from './wire'

function normalizeSort(sort: RedditCommentSort): string {
  return sort === 'best' ? 'confidence' : sort
}

/** Bearer-first → public. Parses Reddit's 2-element [postListing, commentsListing] response. */
export async function getPostComments(
  ctx: ProviderCtx,
  postId: string,
  sort: RedditCommentSort = 'confidence',
): Promise<RedditCommentsResult> {
  const s = normalizeSort(sort)
  const authedUrl = `${ctx.endpoints.reddit}/comments/${postId}.json?sort=${s}&limit=50&raw_json=1`
  const publicUrl = `${ctx.endpoints.redditPublic}/comments/${postId}.json?sort=${s}&depth=5&limit=500&raw_json=1`

  let body: any = null
  try {
    body = await ctx.request.json(authedUrl, { platform: 'reddit' })
  } catch (e) {
    ctx.log.warn('[reddit] authed comments failed, trying public', e)
  }
  if (!body) {
    try {
      body = await ctx.request.json(publicUrl)
    } catch (e) {
      ctx.log.warn('[reddit] public comments failed', e)
      return { comments: [], rootMoreChildrenIds: [], linkFullname: `t3_${postId}` }
    }
  }

  const postListing = Array.isArray(body) ? body[0] : undefined
  const commentsListing = Array.isArray(body) ? body[1] : undefined
  const postData = postListing?.data?.children?.[0]?.data ?? {}
  const children = commentsListing?.data?.children ?? []

  const rootMoreChildrenIds: string[] = []
  for (const child of children) {
    if (child?.kind === 'more' && Array.isArray(child.data?.children)) {
      rootMoreChildrenIds.push(...child.data.children)
    }
  }

  return {
    comments: parseComments(children),
    rootMoreChildrenIds,
    linkFullname: postData.name ?? `t3_${postId}`,
    postTitle: postData.title,
    postAuthor: postData.author,
  }
}
