import { expect, test } from 'vitest'
import { fakeHttp } from './fake-http'

test('routes match by url substring and return json/text', async () => {
  const http = fakeHttp([
    { match: '/api/threads/lookup', json: { thread: null }, status: 200 },
    { match: (url) => url.includes('graphql'), json: { data: { ok: true } } },
  ])
  const r1 = await http('https://discussanime.moe/api/threads/lookup?mal_id=1')
  expect(r1.ok).toBe(true)
  expect(await r1.json()).toEqual({ thread: null })

  const r2 = await http('https://graphql.anilist.co', { method: 'POST', body: '{}' })
  expect(await r2.json()).toEqual({ data: { ok: true } })
})

test('unmatched url → 404 and records the call', async () => {
  const http = fakeHttp([])
  const r = await http('https://nope.test')
  expect(r.status).toBe(404)
  expect(http.calls.map((c) => c.url)).toContain('https://nope.test')
})
