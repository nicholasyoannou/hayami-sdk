import { expect, test } from 'vitest'
import { saveThreadComment, toggleLike } from './write'
import { createRequester } from '../../http/requester'
import { fakeHttp } from '../../testing/fake-http'
import { DEFAULT_ENDPOINTS } from '../../options'
import { AuthRequiredError } from '../../http/errors'

const ctx = (http: ReturnType<typeof fakeHttp>, token = 'tok') => ({
  request: createRequester({ http, getToken: async () => token }), endpoints: DEFAULT_ENDPOINTS,
  getToken: async () => token, log: { debug() {}, warn() {}, error() {} },
})

test('saveThreadComment runs the mutation and normalizes the reply', async () => {
  const http = fakeHttp([{ match: 'graphql.anilist.co', json: { data: { SaveThreadComment: { id: 42, comment: 'hi', createdAt: 100, likeCount: 0, user: { name: 'u', avatar: { large: 'A' } } } } } }])
  const c = await saveThreadComment(ctx(http), { threadId: 7, comment: 'hi' })
  expect(c).toMatchObject({ platform: 'anilist', id: '42', bodyText: 'hi', createdAt: 100000 })
  expect(JSON.parse(http.calls[0]!.body!).variables).toMatchObject({ threadId: 7, comment: 'hi' })
})

test('write without token throws AuthRequiredError', async () => {
  await expect(toggleLike(ctx(fakeHttp([]), ''), 42, 'THREAD_COMMENT')).rejects.toBeInstanceOf(AuthRequiredError)
})
