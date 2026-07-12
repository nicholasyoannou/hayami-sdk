import { expect, test } from 'vitest'
import { redditProvider } from './index'
import { createRequester } from '../../http/requester'
import { fakeHttp } from '../../testing/fake-http'
import { DEFAULT_ENDPOINTS } from '../../options'

const ctx = (http: ReturnType<typeof fakeHttp>) => ({
  request: createRequester({ http }), endpoints: DEFAULT_ENDPOINTS,
  log: { debug() {}, warn() {}, error() {} },
})

test('resolve searches each title and returns reddit ThreadRefs with episode', async () => {
  const http = fakeHttp([{ match: '/r/anime/search.json', json: { data: { children: [
    { data: { id: 'g', title: 'Frieren - Episode 5 discussion', author: 'autolovepon', permalink: '/p/g/', num_comments: 9, created_utc: 1700000000 } },
  ] } } }])
  const refs = await redditProvider.resolve({ titles: ['Frieren'], episode: 5 }, ctx(http))
  expect(refs[0]).toMatchObject({ platform: 'reddit', id: 'g', episode: 5, commentCount: 9 })
})

test('getComments maps to normalized Comment[]', async () => {
  const http = fakeHttp([{ match: '/comments/g.json', json: [
    { data: { children: [{ data: { name: 't3_g', title: 'Ep 5', author: 'op' } }] } },
    { data: { children: [{ kind: 't1', data: { name: 't1_c', author: 'u', body: 'nice', created_utc: 100 } }] } },
  ] }])
  const comments = await redditProvider.getComments!({ platform: 'reddit', id: 'g' }, ctx(http))
  expect(comments[0]).toMatchObject({ platform: 'reddit', id: 'c', bodyText: 'nice', createdAt: 100000 })
})

test('capabilities: reddit supports everything incl. downvote', () => {
  expect(redditProvider.capabilities()).toEqual({ comment: true, edit: true, delete: true, vote: true, downvote: true })
})
