import { createRequester } from './http/requester'
import { NotSupportedError } from './http/errors'
import { buildRegistry, type ProviderCtx } from './providers/provider'
import { resolveEndpoints, type DiscussionClientOptions, type Logger } from './options'
import type {
  Comment, CommentRef, DiscussionQuery, Platform, PlatformCapabilities, Thread, ThreadRef,
} from './types'
import { redditProvider } from './providers/reddit/index'
import { anilistProvider } from './providers/anilist/index'
import { malProvider } from './providers/mal/index'
import { youtubeProvider } from './providers/youtube/index'
import { forumProvider } from './providers/forum/index'
import { searchRedditDiscussion } from './providers/reddit/search'
import { postToThread } from './providers/reddit/normalize'

const NO_CAPS: PlatformCapabilities = { comment: false, edit: false, delete: false, vote: false, downvote: false }
const noopLogger: Logger = { debug() {}, warn() {}, error() {} }

export interface DiscussionClient {
  resolve(q: DiscussionQuery): Promise<ThreadRef[]>
  getComments(ref: ThreadRef): Promise<Comment[]>
  getDiscussion(q: DiscussionQuery, opts?: { sources?: Platform[]; withComments?: boolean }): Promise<Thread[]>
  searchReddit(titles: string[], episode: number): Promise<Thread | null>
  postComment(ref: ThreadRef, bodyMarkdown: string, opts?: { parentId?: string }): Promise<Comment>
  vote(target: CommentRef, dir: 1 | 0 | -1): Promise<void>
  editComment(ref: CommentRef, bodyMarkdown: string): Promise<Comment>
  deleteComment(ref: CommentRef): Promise<void>
  capabilities(platform: Platform): PlatformCapabilities
}

export function createDiscussionClient(o: DiscussionClientOptions): DiscussionClient {
  const endpoints = resolveEndpoints(o)
  const log = o.logger ?? noopLogger
  const request = createRequester({
    http: o.http, getToken: o.getToken, cache: o.cache, logger: log, defaultTimeoutMs: o.defaultTimeoutMs,
  })
  const ctx: ProviderCtx = { request, endpoints, getToken: o.getToken, youtubeApiKey: o.youtubeApiKey, log }
  const registry = buildRegistry([redditProvider, anilistProvider, malProvider, youtubeProvider, forumProvider])

  async function resolve(q: DiscussionQuery): Promise<ThreadRef[]> {
    const lists = await Promise.all(
      registry.all().map((p) => p.resolve(q, ctx).catch((e) => { log.warn('[resolve]', p.platforms, e); return [] })),
    )
    return lists.flat()
  }

  async function getComments(ref: ThreadRef): Promise<Comment[]> {
    const p = registry.get(ref.platform)
    if (!p?.getComments) return []
    return p.getComments(ref, ctx)
  }

  async function getDiscussion(
    q: DiscussionQuery,
    opts?: { sources?: Platform[]; withComments?: boolean },
  ): Promise<Thread[]> {
    const refs = (await resolve(q)).filter((r) => !opts?.sources || opts.sources.includes(r.platform))
    return Promise.all(refs.map(async (r): Promise<Thread> => {
      const thread: Thread = { platform: r.platform, id: r.id, title: '' }
      if (r.url) thread.url = r.url
      if (typeof r.commentCount === 'number') thread.replyCount = r.commentCount
      if (opts?.withComments) {
        try {
          thread.comments = await getComments(r)
        } catch (e) {
          log.warn('[getDiscussion]', r.platform, e)
          thread.comments = []
        }
      }
      return thread
    }))
  }

  async function searchReddit(titles: string[], episode: number): Promise<Thread | null> {
    for (const title of titles) {
      const posts = await searchRedditDiscussion(ctx, title, episode)
      if (posts.length) return postToThread(posts[0]!)
    }
    return null
  }

  function capabilities(platform: Platform): PlatformCapabilities {
    return registry.get(platform)?.capabilities() ?? NO_CAPS
  }

  async function postComment(ref: ThreadRef, bodyMarkdown: string, opts: { parentId?: string } = {}): Promise<Comment> {
    const p = registry.get(ref.platform)
    if (!p?.postComment) throw new NotSupportedError(ref.platform, 'comment')
    return p.postComment(ref, bodyMarkdown, opts, ctx)
  }

  async function editComment(ref: CommentRef, bodyMarkdown: string): Promise<Comment> {
    const p = registry.get(ref.platform)
    if (!p?.editComment) throw new NotSupportedError(ref.platform, 'edit')
    return p.editComment(ref, bodyMarkdown, ctx)
  }

  async function deleteComment(ref: CommentRef): Promise<void> {
    const p = registry.get(ref.platform)
    if (!p?.deleteComment) throw new NotSupportedError(ref.platform, 'delete')
    return p.deleteComment(ref, ctx)
  }

  async function vote(target: CommentRef, dir: 1 | 0 | -1): Promise<void> {
    const p = registry.get(target.platform)
    if (!p?.vote) throw new NotSupportedError(target.platform, 'vote')
    return p.vote(target, dir, ctx)
  }

  return { resolve, getComments, getDiscussion, searchReddit, capabilities, postComment, editComment, deleteComment, vote }
}
