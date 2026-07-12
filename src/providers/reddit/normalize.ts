import { stripMarkdown } from '../../markdown/strip'
import type { Comment, Thread, ThreadRef } from '../../types'
import type { RedditComment, RedditPost } from './wire'

const REDDIT_WEB = 'https://www.reddit.com'

export function getRedditPostUrl(permalink?: string): string | undefined {
  return permalink ? `${REDDIT_WEB}${permalink}` : undefined
}

function mapDistinguished(d?: string): Comment['distinguished'] {
  if (d === 'moderator') return 'mod'
  if (d === 'admin') return 'admin'
  return undefined
}

function buildFlair(c: RedditComment): string | undefined {
  if (c.author_flair_text) return c.author_flair_text
  if (Array.isArray(c.author_flair_richtext)) {
    const text = c.author_flair_richtext.map((p) => p.t ?? p.a ?? '').join('').trim()
    if (text) return text
  }
  if (c.is_submitter) return 'OP'
  return undefined
}

export function redditCommentToComment(c: RedditComment): Comment {
  const out: Comment = {
    platform: 'reddit',
    id: c.id,
    author: c.author,
    bodyMarkdown: c.body ?? '',
    bodyText: stripMarkdown(c.body ?? ''),
  }
  if (typeof c.score === 'number') out.score = c.score
  if (c.created_utc) out.createdAt = c.created_utc * 1000
  const url = getRedditPostUrl(c.permalink)
  if (url) out.url = url
  const dist = mapDistinguished(c.distinguished)
  if (dist) out.distinguished = dist
  const flair = buildFlair(c)
  if (flair) out.flair = flair
  if (c.replies?.length) out.replies = c.replies.map(redditCommentToComment)
  if (c.moreChildrenIds?.length) out.moreRepliesCursor = JSON.stringify({ link: c.link_id, ids: c.moreChildrenIds })
  return out
}

export function postToThread(p: RedditPost): Thread {
  const t: Thread = { platform: 'reddit', id: p.id, title: p.title }
  const url = getRedditPostUrl(p.permalink)
  if (url) t.url = url
  if (p.author) t.author = p.author
  if (p.created_utc) t.createdAt = p.created_utc * 1000
  if (typeof p.num_comments === 'number') t.replyCount = p.num_comments
  if (typeof p.score === 'number') t.score = p.score
  return t
}

export function postToThreadRef(p: RedditPost, episode?: number): ThreadRef {
  const ref: ThreadRef = { platform: 'reddit', id: p.id }
  const url = getRedditPostUrl(p.permalink)
  if (url) ref.url = url
  if (typeof p.num_comments === 'number') ref.commentCount = p.num_comments
  if (episode != null) ref.episode = episode
  return ref
}
