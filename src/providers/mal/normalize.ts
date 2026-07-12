import { stripBbcode } from './bbcode'
import { extractEpisodeNumbersFromTitle } from '../../episode/episode-utils'
import type { Comment, ThreadRef } from '../../types'
import type { MalForumPost, MalForumTopic } from './wire'

const DEFAULT_AVATAR = 'kaomoji_mal_white.png'

function pickAvatar(a?: MalForumPost['author']): string | undefined {
  const raw = (a?.forum_avatar || a?.forum_avator || a?.avatar || '').trim()
  if (!raw || raw.includes(DEFAULT_AVATAR)) return undefined
  return raw
}

export function malPostToComment(post: MalForumPost): Comment {
  const body = post.body ?? ''
  const out: Comment = {
    platform: 'mal',
    id: String(post.id),
    author: post.author?.name,
    bodyMarkdown: body,
    bodyText: stripBbcode(body),
  }
  const avatar = pickAvatar(post.author)
  if (avatar) out.authorAvatar = avatar
  if (post.author?.forum_title) out.flair = post.author.forum_title
  if (post.created_at) {
    const ms = Date.parse(post.created_at)
    if (Number.isFinite(ms)) out.createdAt = ms
  }
  return out // flat: no replies
}

export function topicToThreadRef(topic: MalForumTopic): ThreadRef {
  const ref: ThreadRef = { platform: 'mal', id: String(topic.id) }
  if (topic.url) ref.url = topic.url
  if (typeof topic.comments === 'number') ref.commentCount = topic.comments
  const eps = extractEpisodeNumbersFromTitle(topic.title)
  if (eps.length) {
    ref.episode = Math.min(...eps)
    if (eps.length > 1) ref.episodeEnd = Math.max(...eps)
  }
  return ref
}
