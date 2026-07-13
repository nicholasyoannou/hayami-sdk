import type { ProviderCtx } from '../provider'
import { REACTION_KEYS, type ReactionKey, type ReactResult, type Reactions } from '../../types'

const LABELS: Record<ReactionKey, string> = {
  upvote: 'Upvote', funny: 'Funny', love: 'Love', surprised: 'Surprised', angry: 'Angry', sad: 'Sad',
}

function reactionUrl(base: string, identifier: string): string {
  return `${base}/api/threads/by-identifier/${encodeURIComponent(identifier)}/reaction`
}

function normalizeCounts(raw: any): Record<ReactionKey, number> {
  const out = {} as Record<ReactionKey, number>
  for (const k of REACTION_KEYS) {
    const n = Number(raw?.[k])
    out[k] = Number.isFinite(n) ? n : 0
  }
  return out
}

function normalizeSprites(raw: any): Partial<Record<ReactionKey, string>> {
  const out: Partial<Record<ReactionKey, string>> = {}
  for (const k of REACTION_KEYS) {
    if (typeof raw?.[k] === 'string') out[k] = raw[k]
  }
  return out
}

/** GET discussanime reactions for a forum/disqus thread identifier. Null on miss/error. */
export async function fetchReactions(ctx: ProviderCtx, identifier: string): Promise<Reactions | null> {
  let body: any
  try {
    body = await ctx.request.json(reactionUrl(ctx.endpoints.mapper, identifier))
  } catch (e) {
    ctx.log.warn('[forum] reactions fetch failed', e)
    return null
  }
  if (!body || typeof body !== 'object') return null
  const counts = normalizeCounts(body.counts)
  const selectedKey = (REACTION_KEYS as readonly string[]).includes(body.selectedKey) ? (body.selectedKey as ReactionKey) : null
  return {
    threadId: typeof body.threadId === 'number' ? body.threadId : undefined,
    heading: typeof body.heading === 'string' ? body.heading : undefined,
    keys: [...REACTION_KEYS],
    labels: LABELS,
    sprites: normalizeSprites(body.sprites),
    counts,
    selectedKey,
    loggedIn: !!body.loggedIn,
    total: REACTION_KEYS.reduce((s, k) => s + counts[k], 0),
  }
}

/** POST a reaction (null clears). 401 → needsLogin. */
export async function postReaction(ctx: ProviderCtx, identifier: string, key: ReactionKey | null): Promise<ReactResult> {
  const res = await ctx.request.request(reactionUrl(ctx.endpoints.mapper, identifier), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reaction: key }),
  })
  if (res.status === 401) return { ok: false, needsLogin: true }
  if (!res.ok) return { ok: false, needsLogin: false }
  const body = (await res.json()) as any
  return { ok: true, needsLogin: false, counts: normalizeCounts(body?.counts) }
}
