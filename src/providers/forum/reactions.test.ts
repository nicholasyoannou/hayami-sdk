import { expect, test } from 'vitest'
import { fetchReactions, postReaction } from './reactions'
import { createRequester } from '../../http/requester'
import { fakeHttp } from '../../testing/fake-http'
import { DEFAULT_ENDPOINTS } from '../../options'

const ctx = (http: ReturnType<typeof fakeHttp>) => ({
  request: createRequester({ http }), endpoints: DEFAULT_ENDPOINTS,
  log: { debug() {}, warn() {}, error() {} },
})

test('fetchReactions normalizes the payload', async () => {
  const http = fakeHttp([{ match: '/api/threads/by-identifier/thread-5/reaction', json: {
    threadId: 5, heading: 'What do you think?',
    sprites: { love: 'https://s/love.png', funny: 'https://s/funny.png' },
    counts: { upvote: 3, love: 2 }, selectedKey: 'love', loggedIn: true,
  } }])
  const r = (await fetchReactions(ctx(http), 'thread-5'))!
  expect(r.threadId).toBe(5)
  expect(r.keys).toEqual(['upvote', 'funny', 'love', 'surprised', 'angry', 'sad'])
  expect(r.counts).toEqual({ upvote: 3, funny: 0, love: 2, surprised: 0, angry: 0, sad: 0 })
  expect(r.total).toBe(5)
  expect(r.selectedKey).toBe('love')
  expect(r.sprites.love).toBe('https://s/love.png')
  expect(r.loggedIn).toBe(true)
})

test('fetchReactions returns null on error', async () => {
  const http = fakeHttp([{ match: '/reaction', status: 500, json: {} }])
  expect(await fetchReactions(ctx(http), 'thread-9')).toBeNull()
})

test('postReaction returns counts on success, needsLogin on 401', async () => {
  const ok = fakeHttp([{ match: '/reaction', json: { counts: { love: 3 } } }])
  const r = await postReaction(ctx(ok), 'thread-5', 'love')
  expect(r).toMatchObject({ ok: true, needsLogin: false })
  expect(r.counts!.love).toBe(3)
  expect(JSON.parse(ok.calls[0]!.body!)).toEqual({ reaction: 'love' })

  const un = fakeHttp([{ match: '/reaction', status: 401, json: {} }])
  expect(await postReaction(ctx(un), 'thread-5', null)).toEqual({ ok: false, needsLogin: true })
})
