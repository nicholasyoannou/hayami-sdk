import { expect, test } from 'vitest'
import { anilistProvider } from './index'
import { createRequester } from '../../http/requester'
import { fakeHttp } from '../../testing/fake-http'
import { DEFAULT_ENDPOINTS } from '../../options'

const ctx = (http: ReturnType<typeof fakeHttp>) => ({
  request: createRequester({ http }), endpoints: DEFAULT_ENDPOINTS,
  log: { debug() {}, warn() {}, error() {} },
})

test('resolve returns anilist ThreadRefs, episode-filtered when possible', async () => {
  const http = fakeHttp([{ match: 'graphql.anilist.co', json: { data: { Page: { threads: [
    { id: 1, title: 'Episode 5 Discussion', replyCount: 7, siteUrl: 'https://anilist.co/forum/thread/1' },
    { id: 2, title: 'Episode 6 Discussion', replyCount: 3, siteUrl: 'https://anilist.co/forum/thread/2' },
  ] } } } }])
  const refs = await anilistProvider.resolve({ anilistId: 123, episode: 5 }, ctx(http))
  expect(refs.map((r) => r.id)).toEqual(['1'])
})

test('capabilities: comment/edit/vote yes, delete/downvote no', () => {
  expect(anilistProvider.capabilities()).toEqual({ comment: true, edit: true, delete: false, vote: true, downvote: false })
})
