import type { Requester } from '../http/requester'
import type { DisqusEmbedInput, Endpoints, Logger } from '../options'
import type {
  Comment, CommentRef, DiscussionQuery, Platform, PlatformCapabilities, ThreadRef,
} from '../types'

export interface ProviderCtx {
  request: Requester
  endpoints: Endpoints
  getToken?(p: Platform): string | undefined | Promise<string | undefined>
  youtubeApiKey?: string
  log: Logger
  disqusEmbed?(input: DisqusEmbedInput): string
}

export interface PostCommentOpts {
  parentId?: string
}

export interface Provider {
  platforms: Platform[]
  resolve(q: DiscussionQuery, ctx: ProviderCtx): Promise<ThreadRef[]>
  getComments?(ref: ThreadRef, ctx: ProviderCtx): Promise<Comment[]>
  capabilities(): PlatformCapabilities
  postComment?(ref: ThreadRef, bodyMarkdown: string, opts: PostCommentOpts, ctx: ProviderCtx): Promise<Comment>
  editComment?(ref: CommentRef, bodyMarkdown: string, ctx: ProviderCtx): Promise<Comment>
  deleteComment?(ref: CommentRef, ctx: ProviderCtx): Promise<void>
  vote?(target: CommentRef, dir: 1 | 0 | -1, ctx: ProviderCtx): Promise<void>
}

export interface Registry {
  get(p: Platform): Provider | undefined
  all(): Provider[]
}

export function buildRegistry(providers: Provider[]): Registry {
  const byPlatform = new Map<Platform, Provider>()
  for (const prov of providers) {
    for (const p of prov.platforms) byPlatform.set(p, prov)
  }
  return {
    get: (p) => byPlatform.get(p),
    all: () => providers,
  }
}
