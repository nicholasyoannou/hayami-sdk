import type { ProviderCtx } from '../provider'
import type { YouTubeComment } from './wire'

function mapThreadItem(item: any): YouTubeComment {
  const s = item?.snippet?.topLevelComment?.snippet ?? {}
  const replies: YouTubeComment[] = (item?.replies?.comments ?? []).map((r: any) => ({
    id: r.id, author: r.snippet?.authorDisplayName, authorProfileImageUrl: r.snippet?.authorProfileImageUrl,
    textDisplay: r.snippet?.textDisplay, likeCount: r.snippet?.likeCount, publishedAt: r.snippet?.publishedAt, parentId: r.snippet?.parentId,
  }))
  const c: YouTubeComment = {
    id: item.id, author: s.authorDisplayName, authorProfileImageUrl: s.authorProfileImageUrl,
    textDisplay: s.textDisplay, likeCount: s.likeCount, publishedAt: s.publishedAt, replyCount: item?.snippet?.totalReplyCount,
  }
  if (replies.length) c.replies = replies
  return c
}

/** GET commentThreads (bearer via getToken('youtube')). */
export async function getVideoComments(ctx: ProviderCtx, videoId: string): Promise<YouTubeComment[]> {
  const keyParam = ctx.youtubeApiKey ? `&key=${ctx.youtubeApiKey}` : ''
  const url = `${ctx.endpoints.youtube}/commentThreads?part=snippet,replies&videoId=${videoId}&maxResults=50&order=relevance&textFormat=plainText${keyParam}`
  try {
    const body = await ctx.request.json<any>(url, ctx.youtubeApiKey ? {} : { platform: 'youtube' })
    return Array.isArray(body?.items) ? body.items.map(mapThreadItem) : []
  } catch (e) {
    ctx.log.warn('[youtube] commentThreads failed', e)
    return []
  }
}
