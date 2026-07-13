import type { ThreadRef } from '../../types'
import type { AnimeThreadRow, LookupThreadRow } from './wire'

// Disqus's embed comments page bootstraps off the `#version=` fragment; a raw
// iframe without it (and the full param set) renders blank. This is Disqus's
// embed build hash — update it if Disqus bumps its embed version.
const DISQUS_EMBED_VERSION = '6a1aabb94f5e0fb7334f0cd7f5a7679c'

/**
 * Direct Disqus embed iframe URL that renders standalone (reproduces exactly
 * what the Disqus loader builds: full param set + `#version` fragment,
 * `encodeURIComponent`-encoded so spaces are `%20`, not `+`).
 */
function disqusEmbedUrl(row: { forum_shortname?: string; identifier: string | number; url: string; title: string }): string | undefined {
  if (!row.forum_shortname || row.identifier == null) return undefined
  const enc = encodeURIComponent
  const title = enc(row.title ?? '')
  const query =
    'base=default' +
    `&f=${enc(row.forum_shortname)}` +
    `&t_i=${enc(String(row.identifier))}` +
    `&t_u=${enc(row.url)}` +
    `&t_e=${title}` +
    '&t_d=' +
    `&t_t=${title}` +
    '&s_o=default'
  return `https://disqus.com/embed/comments/?${query}#version=${DISQUS_EMBED_VERSION}`
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
