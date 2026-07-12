import { expect, test } from 'vitest'
import { malProvider } from './index'
import { createRequester } from '../../http/requester'
import { fakeHttp } from '../../testing/fake-http'
import { DEFAULT_ENDPOINTS } from '../../options'

const ctx = (http: ReturnType<typeof fakeHttp>, getToken?: any) => ({
  request: createRequester({ http, getToken }), endpoints: DEFAULT_ENDPOINTS,
  getToken, log: { debug() {}, warn() {}, error() {} },
})

test('resolve uses malId → Jikan topics → episode topic → ThreadRef', async () => {
  const http = fakeHttp([{ match: '/anime/21/forum', json: { data: [
    { mal_id: 100, title: 'Episode 5 Discussion', comments: 8, url: 'https://myanimelist.net/forum/?topicid=100' },
    { mal_id: 101, title: 'General', comments: 2 },
  ] } }])
  const refs = await malProvider.resolve({ malId: 21, episode: 5 }, ctx(http))
  expect(refs).toHaveLength(1)
  expect(refs[0]).toMatchObject({ platform: 'mal', id: '100', episode: 5 })
})

test('getComments returns [] without a MAL token (tolerant read)', async () => {
  const http = fakeHttp([])
  const comments = await malProvider.getComments!({ platform: 'mal', id: '100' }, ctx(http))
  expect(comments).toEqual([])
  expect(http.calls.length).toBe(0)
})

test('capabilities: MAL read-only in v1', () => {
  expect(malProvider.capabilities()).toEqual({ comment: false, edit: false, delete: false, vote: false, downvote: false })
})
