import { expect, test } from 'vitest'
import { getPostComments } from './comments'
import { createRequester } from '../../http/requester'
import { fakeHttp } from '../../testing/fake-http'
import { DEFAULT_ENDPOINTS } from '../../options'

const ctx = (http: ReturnType<typeof fakeHttp>) => ({
  request: createRequester({ http }), endpoints: DEFAULT_ENDPOINTS,
  log: { debug() {}, warn() {}, error() {} },
})

test('parses the [post, comments] array, extracts linkFullname and root more-cursor', async () => {
  const http = fakeHttp([{ match: '/comments/abc.json', json: [
    { data: { children: [{ data: { name: 't3_abc', title: 'Ep 5', author: 'op' } }] } },
    { data: { children: [
      { kind: 't1', data: { name: 't1_c1', author: 'u', body: 'hi', created_utc: 100 } },
      { kind: 'more', data: { count: 7, children: ['m1', 'm2'] } },
    ] } },
  ] }])
  const res = await getPostComments(ctx(http), 'abc')
  expect(res.linkFullname).toBe('t3_abc')
  expect(res.postTitle).toBe('Ep 5')
  expect(res.comments[0]!.id).toBe('c1')
  expect(res.rootMoreChildrenIds).toEqual(['m1', 'm2'])
})
