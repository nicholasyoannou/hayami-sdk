export interface PlaylistVideo { video_id: string; title: string; position?: number; published_at?: string }
export interface Playlist { title?: string; videos: PlaylistVideo[] }

export interface YouTubeComment {
  id: string
  author?: string
  authorProfileImageUrl?: string
  textDisplay?: string
  likeCount?: number
  publishedAt?: string // ISO
  parentId?: string
  replies?: YouTubeComment[]
  replyCount?: number
}
