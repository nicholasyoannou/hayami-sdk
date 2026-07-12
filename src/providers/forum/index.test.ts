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
