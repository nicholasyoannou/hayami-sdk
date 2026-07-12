import type { ProviderCtx } from '../provider'
import type { Comment } from '../../types'
import { anilistQuery } from './client'
import { SAVE_COMMENT_MUTATION, TOGGLE_LIKE_MUTATION } from './graphql'
import { anilistCommentToComment, normalizeComment } from './normalize'

export async function saveThreadComment(
  ctx: ProviderCtx,
  args: { threadId?: number; parentCommentId?: number; comment: string; id?: number },
): Promise<Comment> {
  const data = await anilistQuery<any>(ctx, SAVE_COMMENT_MUTATION, {
    id: args.id, threadId: args.threadId, parentCommentId: args.parentCommentId, comment: args.comment,
  }, { auth: true })
  const norm = normalizeComment(data?.SaveThreadComment)
  if (!norm) throw new Error('anilist: empty SaveThreadComment response')
  return anilistCommentToComment(norm)
}

export async function toggleLike(ctx: ProviderCtx, id: number, type: 'THREAD' | 'THREAD_COMMENT'): Promise<void> {
  await anilistQuery(ctx, TOGGLE_LIKE_MUTATION, { id, type }, { auth: true })
}
