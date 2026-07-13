export const PLATFORMS = ['reddit', 'anilist', 'mal', 'youtube', 'forum', 'disqus'] as const
export type Platform = (typeof PLATFORMS)[number]

export interface DiscussionQuery {
  anilistId?: number
  malId?: number
  titles?: string[]
  episode?: number | null
  isMovie?: boolean
}

export interface ThreadRef {
  platform: Platform
  id: string
  url?: string
  episode?: number
  episodeEnd?: number
  commentCount?: number
  embedUrl?: string
}

export interface Thread {
  platform: Platform
  id: string
  title: string
  url?: string
  embedUrl?: string
  author?: string
  createdAt?: number // epoch ms
  replyCount?: number
  score?: number
  comments?: Comment[]
}

export interface Comment {
  platform: Platform
  id: string
  author?: string
  authorAvatar?: string
  bodyMarkdown: string
  bodyText: string
  score?: number
  createdAt?: number // epoch ms
  url?: string
  distinguished?: 'mod' | 'admin'
  flair?: string
  replies?: Comment[]
  moreRepliesCursor?: string
}

export interface CommentRef {
  platform: Platform
  id: string
}

export interface PlatformCapabilities {
  comment: boolean
  edit: boolean
  delete: boolean
  vote: boolean
  downvote: boolean
}
