import { expect, test } from 'vitest'
import { forumProvider } from './index'
import { createRequester } from '../../http/requester'
import { fakeHttp } from '../../testing/fake-http'
import { DEFAULT_ENDPOINTS } from '../../options'

function ctx(http: ReturnType<typeof fakeHttp>) {
  return { request: createRequester({ http }), endpoints: DEFAULT_ENDPOINTS, log: { debug() {}, warn() {}, error() {} } }
}

test('resolve maps a discussanime by-anime hit to a ThreadRef', async () => {
  const http = fakeHttp([{ match: '/api/threads/by-anime', json: {
    threads: [{ id: 1, slug: 's', title: 'Ep 5', episode_number: 5, episode_number_end: null, comment_count: 3, created_at: 0, identifier: 'thread-5', url: 'https://discussanime.moe/t/5', forum_shortname: 'f', is_embed: 1, embed_url: 'https://discussanime.moe/embed/5' }],
    has_more: false,
  } }])
  const refs = await forumProvider.resolve({ malId: 21, episode: 5 }, ctx(http))
  expect(refs).toHaveLength(1)
  expect(refs[0]).toMatchObject({ platform: 'forum', id: 'thread-5', episode: 5, embedUrl: 'https://discussanime.moe/embed/5' })
})

test('resolve returns [] when there is no id to query on', async () => {
  const http = fakeHttp([])
  expect(await forumProvider.resolve({ episode: 5 }, ctx(http))).toEqual([])
  expect(http.calls.length).toBe(0)
})

test('getComments is not implemented (resolve-only provider)', () => {
  expect(forumProvider.getComments).toBeUndefined()
  expect(forumProvider.capabilities()).toEqual({ comment: false, edit: false, delete: false, vote: false, downvote: false })
})

test('resolve uses ctx.disqusEmbed to override the disqus embedUrl', async () => {
  const http = fakeHttp([{ match: '/api/threads/by-anime', json: {
    threads: [{ id: 1, slug: 's', title: 'T', episode_number: 5, episode_number_end: null, comment_count: 2, created_at: 0, identifier: 'thread-5', url: 'https://d.test/t/5', forum_shortname: 'sub', is_embed: 0 }],
    has_more: false,
  } }])
  const custom = { ...ctx(http), disqusEmbed: (t: any) => `https://hayami.moe/embed/tac?f=${t.forumShortname}&id=${t.identifier}&ep=${t.episode}&mal=${t.malId}` }
  const refs = await forumProvider.resolve({ malId: 21, episode: 5 }, custom as any)
  expect(refs[0]!.platform).toBe('disqus')
  expect(refs[0]!.embedUrl).toBe('https://hayami.moe/embed/tac?f=sub&id=thread-5&ep=5&mal=21')
})

test('resolve keeps the default Disqus embedUrl when no disqusEmbed is given', async () => {
  const http = fakeHttp([{ match: '/api/threads/by-anime', json: {
    threads: [{ id: 1, slug: 's', title: 'T', episode_number: 5, episode_number_end: null, comment_count: 2, created_at: 0, identifier: 'thread-5', url: 'https://d.test/t/5', forum_shortname: 'sub', is_embed: 0 }],
    has_more: false,
  } }])
  const refs = await forumProvider.resolve({ malId: 21, episode: 5 }, ctx(http))
  expect(refs[0]!.embedUrl).toContain('https://disqus.com/embed/comments/')
})
