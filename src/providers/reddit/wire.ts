export type RedditCommentSort = 'confidence' | 'top' | 'new' | 'old' | 'controversial' | 'qa' | 'best'

export interface RedditFlairPart {
  e?: 'emoji' | 'text'
  t?: string
  a?: string
  u?: string
}

export interface RedditComment {
  id: string // base36, t1_ stripped
  author?: string
  body: string
  body_html?: string
  score?: number
  created_utc?: number // SECONDS
  permalink?: string
  link_id?: string // t3_ post fullname
  distinguished?: string // raw reddit: 'moderator' | 'admin'
  is_submitter?: boolean
  stickied?: boolean
  author_flair_text?: string | null
  author_flair_richtext?: RedditFlairPart[]
  replies?: RedditComment[]
  moreCount?: number
  moreChildrenIds?: string[]
}

export interface RedditPost {
  id: string // base36, no t3_
  title: string
  author?: string
  url?: string
  permalink: string
  score?: number
  num_comments?: number
  created_utc?: number // SECONDS
  link_flair_text?: string | null
}

export interface RedditCommentsResult {
  comments: RedditComment[]
  rootMoreChildrenIds: string[]
  linkFullname: string
  postTitle?: string
  postAuthor?: string
}
