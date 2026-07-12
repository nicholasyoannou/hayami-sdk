import type { PostCommentOpts, ProviderCtx } from '../provider'
import type { Comment, CommentRef, ThreadRef } from '../../types'
import { redditCommentToComment } from './normalize'
import type { RedditComment } from './wire'

function ensureFullname(id: string, kind: 't1' | 't3'): string {
  return /^t[1-6]_/.test(id) ? id : `${kind}_${id}`
}

async function redditForm(ctx: ProviderCtx, path: string, params: Record<string, string>): Promise<any> {
  const res = await ctx.request.request(`${ctx.endpoints.reddit}/api/${path}`, {
    method: 'POST', platform: 'reddit', auth: true,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  })
  const json = (await res.json()) as any
  const errors = json?.json?.errors
  if (Array.isArray(errors) && errors.length) {
    throw new Error(`reddit: ${Array.isArray(errors[0]) ? errors[0].join(' ') : String(errors[0])}`)
  }
  return json
}

function thingToComment(data: any, fallbackText: string, fallbackId?: string): Comment {
  const rc: RedditComment = {
    id: String(data.id ?? fallbackId ?? '').replace(/^t1_/, ''),
    author: data.author,
    body: data.body ?? fallbackText,
    score: typeof data.score === 'number' ? data.score : 1,
    created_utc: data.created_utc,
    permalink: data.permalink,
    link_id: data.link_id,
  }
  return redditCommentToComment(rc)
}

export async function submitComment(ctx: ProviderCtx, ref: ThreadRef, text: string, opts: PostCommentOpts): Promise<Comment> {
  const thingId = opts.parentId ? ensureFullname(opts.parentId, 't1') : ensureFullname(ref.id, 't3')
  const json = await redditForm(ctx, 'comment', { api_type: 'json', text, thing_id: thingId })
  return thingToComment(json?.json?.data?.things?.[0]?.data ?? {}, text)
}

export async function editComment(ctx: ProviderCtx, ref: CommentRef, text: string): Promise<Comment> {
  const json = await redditForm(ctx, 'editusertext', { api_type: 'json', thing_id: ensureFullname(ref.id, 't1'), text })
  return thingToComment(json?.json?.data?.things?.[0]?.data ?? {}, text, ref.id)
}

export async function deleteComment(ctx: ProviderCtx, ref: CommentRef): Promise<void> {
  await redditForm(ctx, 'del', { api_type: 'json', id: ensureFullname(ref.id, 't1') })
}

export async function voteThing(ctx: ProviderCtx, target: CommentRef, dir: 1 | 0 | -1): Promise<void> {
  await redditForm(ctx, 'vote', { id: ensureFullname(target.id, 't1'), dir: String(dir) })
}
