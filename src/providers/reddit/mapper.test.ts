import { expect, test } from 'vitest'
import { fetchRedditThreadMap, redditPostIdFromUrl, stripSeasonSuffix } from './mapper'
import { createRequester } from '../../http/requester'
import { fakeHttp } from '../../testing/fake-http'
import { DEFAULT_ENDPOINTS } from '../../options'

const ctx = (http: ReturnType<typeof fakeHttp>) => ({
  request: createRequester({ http }), endpoints: DEFAULT_ENDPOINTS,
  log: { debug() {}, warn() {}, error() {} },
})

test('stripSeasonSuffix removes season markers', () => {
  expect(stripSeasonSuffix('Hells Paradise Season 2')).toBe('Hells Paradise')
  expect(stripSeasonSuffix('Attack on Titan S4')).toBe('Attack on Titan')
  expect(stripSeasonSuffix('Frieren')).toBe('Frieren')
})

test('redditPostIdFromUrl extracts the base36 id', () => {
  expect(redditPostIdFromUrl('https://www.reddit.com/r/anime/comments/abc123/frieren_ep_5/')).toBe('abc123')
  expect(redditPostIdFromUrl('/r/anime/comments/def456/')).toBe('def456')
  expect(redditPostIdFromUrl('no id here')).toBeNull()
})

test('fetchRedditThreadMap resolves the episode thread from the mapper', async () => {
  const http = fakeHttp([{ match: 'api.hayami.moe/anime/search', json: { results: [
    { anime_name: 'Frieren', is_exact_match: true, external_sites: { mal_id: 52991 },
      episodes: { '4': 'https://www.reddit.com/r/anime/comments/e4/x/', '5': 'https://www.reddit.com/r/anime/comments/e5/y/' } },
  ] } }])
  const refs = await fetchRedditThreadMap(ctx(http), { titles: ['Frieren'], episode: 5, malId: 52991 })
  expect(refs).toEqual([{ platform: 'reddit', id: 'e5', url: 'https://www.reddit.com/r/anime/comments/e5/y/', episode: 5 }])
})

test('fetchRedditThreadMap returns [] when the episode is not mapped', async () => {
  const http = fakeHttp([{ match: '/anime/search', json: { results: [{ episodes: { '1': 'https://www.reddit.com/r/anime/comments/z/z/' } }] } }])
  expect(await fetchRedditThreadMap(ctx(http), { titles: ['X'], episode: 9 })).toEqual([])
})
