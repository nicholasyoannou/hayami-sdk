import type { ThreadRef } from '../../types'
import type { AnimeThreadRow, LookupThreadRow } from './wire'

export function rowToThreadRef(row: AnimeThreadRow): ThreadRef {
  const isEmbed = row.is_embed === 1
  const ref: ThreadRef = {
    platform: isEmbed ? 'forum' : 'disqus',
    id: String(row.identifier),
    url: row.url,
  }
  if (row.episode_number != null) ref.episode = row.episode_number
  if (row.episode_number_end != null) ref.episodeEnd = row.episode_number_end
  if (row.comment_count != null) ref.commentCount = row.comment_count
  if (isEmbed && row.embed_url) ref.embedUrl = row.embed_url
  return ref
}

export function lookupRowToThreadRef(row: LookupThreadRow): ThreadRef {
  const isEmbed = row.is_embed === 1
  const ref: ThreadRef = {
    platform: isEmbed ? 'forum' : 'disqus',
    id: String(row.identifier),
    url: row.url,
  }
  if (isEmbed && row.embed_url) ref.embedUrl = row.embed_url
  return ref
}
