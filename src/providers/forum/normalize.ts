import type { ThreadRef } from '../../types'
import type { AnimeThreadRow, LookupThreadRow } from './wire'

/** Direct Disqus embed iframe URL — what the Disqus loader builds internally. */
function disqusEmbedUrl(row: { forum_shortname?: string; identifier: string | number; url: string; title: string }): string | undefined {
  if (!row.forum_shortname || row.identifier == null) return undefined
  const p = new URLSearchParams({
    base: 'default',
    f: row.forum_shortname,
    t_i: String(row.identifier),
    t_u: row.url,
    t_t: row.title,
  })
  return `https://disqus.com/embed/comments/?${p.toString()}`
}

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
  if (isEmbed) {
    if (row.embed_url) ref.embedUrl = row.embed_url
  } else {
    const embed = disqusEmbedUrl(row)
    if (embed) ref.embedUrl = embed
  }
  return ref
}

export function lookupRowToThreadRef(row: LookupThreadRow): ThreadRef {
  const isEmbed = row.is_embed === 1
  const ref: ThreadRef = {
    platform: isEmbed ? 'forum' : 'disqus',
    id: String(row.identifier),
    url: row.url,
  }
  if (isEmbed) {
    if (row.embed_url) ref.embedUrl = row.embed_url
  } else {
    const embed = disqusEmbedUrl(row)
    if (embed) ref.embedUrl = embed
  }
  return ref
}
