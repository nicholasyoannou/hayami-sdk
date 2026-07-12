import { expect, test } from 'vitest'
import { searchRedditDiscussion } from './search'
import { createRequester } from '../../http/requester'
import { fakeHttp } from '../../testing/fake-http'
import { DEFAULT_ENDPOINTS } from '../../options'

const ctx = (http: ReturnType<typeof fakeHttp>) => ({
  request: createRequester({ http }), endpoints: DEFAULT_ENDPOINTS,
  log: { debug() {}, warn() {}, error() {} },
})

const listing = (posts: any[]) => ({ data: { children: posts.map((data) => ({ kind: 't3', data })) } })

test('keeps only maintainer episode-discussion posts that match name+episode', async () => {
  const http = fakeHttp([{ match: '/r/anime/search.json', json: listing([
    { id: 'good', title: 'Frieren - Episode 5 discussion', author: 'autolovepon', permalink: '/p/good/', num_comments: 10, created_utc: 1700000000 },
    { id: 'bad', title: 'Frieren fan art', author: 'someone', permalink: '/p/bad/', num_comments: 2, created_utc: 1700000000 },
  ]) }])
  const posts = await searchRedditDiscussion(ctx(http), 'Frieren', 5)
  expect(posts.map((p) => p.id)).toEqual(['good'])
})

test('falls back to the public host when the bearer request fails', async () => {
  const http = fakeHttp([
    { match: 'oauth.reddit.com', status: 403, json: {} },
    { match: 'www.reddit.com/r/anime/search.json', json: listing([
      { id: 'x', title: 'Show - Episode 1 discussion', author: 'shadoxfix', permalink: '/p/x/', num_comments: 1, created_utc: 1420000000 },
    ]) },
  ])
  const posts = await searchRedditDiscussion(ctx(http), 'Show', 1)
  expect(posts.map((p) => p.id)).toEqual(['x'])
})
