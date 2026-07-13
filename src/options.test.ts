import { expect, test } from 'vitest'
import { DEFAULT_ENDPOINTS, resolveEndpoints } from './options'

test('default endpoints point at the real public hosts', () => {
  expect(DEFAULT_ENDPOINTS.mapper).toBe('https://discussanime.moe')
  expect(DEFAULT_ENDPOINTS.anilist).toBe('https://graphql.anilist.co')
  expect(DEFAULT_ENDPOINTS.hayamiMapper).toBe('https://api.hayami.moe')
  expect(DEFAULT_ENDPOINTS.tacScript).toBe('https://theanimecommunity.com/embed.js')
})

test('mapperBaseUrl overrides endpoints.mapper', () => {
  const e = resolveEndpoints({ mapperBaseUrl: 'https://example.test', endpoints: {} })
  expect(e.mapper).toBe('https://example.test')
  expect(e.reddit).toBe(DEFAULT_ENDPOINTS.reddit)
})

test('endpoints map wins over mapperBaseUrl for non-mapper hosts', () => {
  const e = resolveEndpoints({ endpoints: { reddit: 'https://proxy.test/reddit' } })
  expect(e.reddit).toBe('https://proxy.test/reddit')
})
