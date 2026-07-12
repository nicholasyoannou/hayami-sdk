import { expect, test } from 'vitest'
import { submitComment, editComment, deleteComment, voteThing } from './write'
import { createRequester } from '../../http/requester'
import { fakeHttp } from '../../testing/fake-http'
import { DEFAULT_ENDPOINTS } from '../../options'
import { AuthRequiredError } from '../../http/errors'

const ctx = (http: ReturnType<typeof fakeHttp>, token = 'tok') => ({
  request: createRequester({ http, getToken: async () => token }), endpoints: DEFAULT_ENDPOINTS,
  getToken: async () => token, log: { debug() {}, warn() {}, error() {} },
})

test('submitComment posts to oauth /api/comment with bearer and returns a Comment', async () => {
  const http = fakeHttp([{ match: 'oauth.reddit.com/api/comment', json: { json: { errors: [], data: { things: [{ data: { id: 't1_new', author: 'me', body: 'hello', created_utc: 100, permalink: '/p/new/' } }] } } } }])
  const c = await submitComment(ctx(http), { platform: 'reddit', id: 'post1' }, 'hello', {})
  expect(c).toMatchObject({ platform: 'reddit', id: 'new', author: 'me', bodyMarkdown: 'hello' })
  expect(http.calls[0]!.headers!.Authorization).toBe('Bearer tok')
  expect(http.calls[0]!.body).toContain('thing_id=t3_post1')
})

test('reply uses the parentId as a t1_ fullname', async () => {
  const http = fakeHttp([{ match: '/api/comment', json: { json: { errors: [], data: { things: [{ data: { id: 't1_r' } }] } } } }])
  await submitComment(ctx(http), { platform: 'reddit', id: 'post1' }, 'hi', { parentId: 'abc' })
  expect(http.calls[0]!.body).toContain('thing_id=t1_abc')
})

test('vote posts dir; errors array throws', async () => {
  const ok = fakeHttp([{ match: '/api/vote', json: { json: { errors: [] } } }])
  await voteThing(ctx(ok), { platform: 'reddit', id: 'abc' }, -1)
  expect(ok.calls[0]!.body).toBe('id=t1_abc&dir=-1')

  const bad = fakeHttp([{ match: '/api/editusertext', json: { json: { errors: [['NO_TEXT', 'we need text']] } } }])
  await expect(editComment(ctx(bad), { platform: 'reddit', id: 'abc' }, '')).rejects.toThrow(/reddit/)
})

test('write without a token throws AuthRequiredError', async () => {
  const http = fakeHttp([])
  await expect(deleteComment(ctx(http, ''), { platform: 'reddit', id: 'abc' })).rejects.toBeInstanceOf(AuthRequiredError)
})
