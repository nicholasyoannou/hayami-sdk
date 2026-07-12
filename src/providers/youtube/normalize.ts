import type { Comment } from '../../types'
import type { YouTubeComment } from './wire'

export function youtubeCommentToComment(c: YouTubeComment): Comment {
  const text = c.textDisplay ?? ''
  const out: Comment = {
    platform: 'youtube',
    id: c.id,
    author: c.author,
    authorAvatar: c.authorProfileImageUrl,
    bodyMarkdown: text, // textFormat=plainText → already plain
    bodyText: text,
  }
  if (typeof c.likeCount === 'number') out.score = c.likeCount
  if (c.publishedAt) {
    const ms = Date.parse(c.publishedAt)
    if (Number.isFinite(ms)) out.createdAt = ms
  }
  if (c.replies?.length) out.replies = c.replies.map(youtubeCommentToComment)
  if (typeof c.replyCount === 'number' && c.replyCount > (c.replies?.length ?? 0)) out.moreRepliesCursor = c.id
  return out
}
