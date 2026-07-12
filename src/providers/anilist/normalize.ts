import { stripMarkdown } from '../../markdown/strip'
import { extractEpisodeNumbersFromTitle } from '../../episode/episode-utils'
import type { Comment, ThreadRef } from '../../types'

export interface AniListUser { id?: number; name?: string; avatar?: string }
export interface AniListThreadComment {
  id: number | string
  comment?: string
  parentCommentId?: number
  createdAt?: number // SECONDS
  likeCount?: number
  isLiked?: boolean
  user?: AniListUser
  depth?: number
  replies?: AniListThreadComment[]
}
export interface AniListThread {
  id: number | string
  title?: string
  replyCount?: number
  likeCount?: number
  createdAt?: number
  siteUrl?: string
  user?: AniListUser
}

export function normalizeUser(user: any): AniListUser | undefined {
  if (!user) return undefined
  const avatar = user.avatar?.large ?? user.avatar?.medium
  return { id: user.id, name: user.name, avatar }
}

function parseChildComments(cc: unknown): any[] {
  if (Array.isArray(cc)) return cc
  if (typeof cc === 'string') {
    try {
      const parsed = JSON.parse(cc)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  if (cc && typeof cc === 'object' && Array.isArray((cc as any).childComments)) return (cc as any).childComments
  return []
}

export function normalizeComment(raw: any, depth = 0): AniListThreadComment | null {
  const id = raw?.id ?? raw?.commentId
  if (id == null) return null
  const c: AniListThreadComment = { id, comment: raw.comment, createdAt: raw.createdAt, likeCount: raw.likeCount, isLiked: raw.isLiked, user: normalizeUser(raw.user), depth }
  if (typeof raw.parentCommentId === 'number') c.parentCommentId = raw.parentCommentId
  const replies = parseChildComments(raw.childComments)
    .map((k) => normalizeComment(k, depth + 1))
    .filter((x): x is AniListThreadComment => x !== null)
  if (replies.length) c.replies = replies
  return c
}

export function anilistCommentToComment(ac: AniListThreadComment): Comment {
  const out: Comment = {
    platform: 'anilist',
    id: String(ac.id),
    author: ac.user?.name,
    authorAvatar: ac.user?.avatar,
    bodyMarkdown: ac.comment ?? '',
    bodyText: stripMarkdown(ac.comment ?? ''),
  }
  if (typeof ac.likeCount === 'number') out.score = ac.likeCount
  if (ac.createdAt) out.createdAt = ac.createdAt * 1000
  if (ac.replies?.length) out.replies = ac.replies.map(anilistCommentToComment)
  return out
}

export function threadToThreadRef(t: AniListThread): ThreadRef {
  const ref: ThreadRef = { platform: 'anilist', id: String(t.id) }
  if (t.siteUrl) ref.url = t.siteUrl
  if (typeof t.replyCount === 'number') ref.commentCount = t.replyCount
  const eps = extractEpisodeNumbersFromTitle(t.title)
  if (eps.length) {
    ref.episode = Math.min(...eps)
    if (eps.length > 1) ref.episodeEnd = Math.max(...eps)
  }
  return ref
}
