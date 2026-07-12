export type MalForumStatus = 'ok' | 'no_topic' | 'auth_required' | 'rate_limited' | 'error'

export interface MalForumTopic {
  id: number | string
  title: string
  created_at?: string // ISO
  author?: { id?: number; name?: string }
  comments?: number
  last_post?: { created_at?: string }
  url?: string
  board_id?: number
  source?: 'mal' | 'jikan'
}

export interface MalForumPost {
  id: number | string
  number?: number
  created_at?: string // ISO
  author?: { id?: number; name?: string; forum_title?: string; forum_avatar?: string; forum_avator?: string; avatar?: string }
  body?: string // BBCode
  signature?: string
}
