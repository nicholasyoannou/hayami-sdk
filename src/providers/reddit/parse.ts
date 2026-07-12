import type { RedditComment } from './wire'

function stripId(name?: string, id?: string, permalink?: string): string {
  const raw = (name ?? id ?? '').replace(/^t1_/, '')
  if (raw) return raw
  const seg = (permalink ?? '').split('/').filter(Boolean).pop()
  return seg ?? ''
}

function normalizeDistinguished(d: Record<string, unknown>): string | undefined {
  const v = (d.distinguished ?? d.distinguished_type) as string | undefined
  if (v === 'moderator' || v === 'admin') return v
  if (d.author_is_mod || d.is_author_mod || d.author_is_moderator) return 'moderator'
  if (d.author_is_admin || d.is_admin || d.author_is_employee) return 'admin'
  return undefined
}

/** Pure. Port of EXT/reddit/comment-parsing.ts parseComments — JSON path only. */
export function parseComments(children: any[]): RedditComment[] {
  const out: RedditComment[] = []
  for (const child of children ?? []) {
    if (child?.kind !== 't1') continue
    const d = child.data ?? {}
    const c: RedditComment = {
      id: stripId(d.name, d.id, d.permalink),
      author: d.author,
      body: d.body ?? '',
      body_html: d.body_html,
      score: typeof d.score === 'number' ? d.score : 0,
      created_utc: typeof d.created_utc === 'number' ? d.created_utc : 0,
      permalink: d.permalink,
      link_id: d.link_id,
      is_submitter: d.is_submitter,
      stickied: d.stickied,
    }
    const dist = normalizeDistinguished(d)
    if (dist) c.distinguished = dist
    if (d.author_flair_text) c.author_flair_text = d.author_flair_text
    if (Array.isArray(d.author_flair_richtext)) c.author_flair_richtext = d.author_flair_richtext

    const rep = d.replies
    if (rep && typeof rep === 'object') {
      if (rep.kind === 'more' && rep.data) {
        c.moreCount = rep.data.count
        c.moreChildrenIds = Array.isArray(rep.data.children) ? rep.data.children : []
      } else if (rep.data && Array.isArray(rep.data.children)) {
        const kids = rep.data.children as any[]
        const nested = parseComments(kids)
        if (nested.length) c.replies = nested
        const more = kids.find((k) => k?.kind === 'more')
        if (more?.data) {
          c.moreCount = more.data.count
          c.moreChildrenIds = Array.isArray(more.data.children) ? more.data.children : []
        }
      }
    }
    out.push(c)
  }
  return out
}
