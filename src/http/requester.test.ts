import { expect, test } from 'vitest'
import { createRequester } from './requester'
import { fakeHttp } from '../testing/fake-http'
import { AuthRequiredError, HttpError } from './errors'

test('attaches bearer from getToken for the given platform', async () => {
  const http = fakeHttp([{ match: '/comments', json: [] }])
  const req = createRequester({ http, getToken: async (p) => (p === 'reddit' ? 'tok123' : undefined) })
  await req.request('https://oauth.reddit.com/comments/x.json', { platform: 'reddit' })
  expect(http.calls[0]!.headers!.Authorization).toBe('Bearer tok123')
})

test('auth:true with no token throws AuthRequiredError before any call', async () => {
  const http = fakeHttp([])
  const req = createRequester({ http })
  await expect(req.request('https://oauth.reddit.com/api/comment', { platform: 'reddit', method: 'POST', auth: true }))
    .rejects.toBeInstanceOf(AuthRequiredError)
  expect(http.calls.length).toBe(0)
})

test('json() throws HttpError on non-ok', async () => {
  const http = fakeHttp([{ match: '/x', status: 500, json: { e: 1 } }])
  const req = createRequester({ http })
  await expect(req.json('https://h.test/x')).rejects.toBeInstanceOf(HttpError)
})

test('caches GET responses through the cache adapter', async () => {
  const store = new Map<string, unknown>()
  const http = fakeHttp([{ match: '/threads', json: { threads: [1] } }])
  const req = createRequester({
    http,
    cache: { get: async (k) => store.get(k), set: async (k, v) => void store.set(k, v) },
  })
  const a = await req.json('https://m.test/threads', { cacheKey: 'threads' })
  const b = await req.json('https://m.test/threads', { cacheKey: 'threads' })
  expect(a).toEqual(b)
  expect(http.calls.length).toBe(1) // second read served from cache
})
