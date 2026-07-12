import { expect, test } from 'vitest'
import { createDiscussionClient } from './client'
import { fakeHttp } from './testing/fake-http'
import { NotSupportedError } from './http/errors'

function client(http: ReturnType<typeof fakeHttp>) {
  return createDiscussionClient({ http })
}

test('resolve fans out across providers and concatenates refs', async () => {
  const http = fakeHttp([
    { match: '/api/threads/by-anime', json: { threads: [
      { id: 1, slug: 's', title: 'Ep 5', episode_number: 5, episode_number_end: null, comment_count: 2, created_at: 0, identifier: 'thread-5', url: 'u', forum_shortname: 'f', is_embed: 1, embed_url: 'e' },
    ], has_more: false } },
    { match: 'graphql.anilist.co', json: { data: { Page: { threads: [] } } } },
    { match: '/r/anime/search.json', json: { data: { children: [] } } },
    { match: 'api.hayami.moe/anime/search', json: { channel_results: [] } },
    { match: '/anime/21/forum', json: { data: [] } },
  ])
  const refs = await client(http).resolve({ malId: 21, anilistId: 5, titles: ['Show'], episode: 5 })
  expect(refs.some((r) => r.platform === 'forum' && r.id === 'thread-5')).toBe(true)
})

test('getComments delegates to the ref platform', async () => {
  const http = fakeHttp([{ match: '/comments/g.json', json: [
    { data: { children: [{ data: { name: 't3_g' } }] } },
    { data: { children: [{ kind: 't1', data: { name: 't1_c', body: 'hi', created_utc: 1 } }] } },
  ] }])
  const comments = await client(http).getComments({ platform: 'reddit', id: 'g' })
  expect(comments[0]!.id).toBe('c')
})

test('searchReddit returns a Thread for the best maintainer post', async () => {
  const http = fakeHttp([{ match: '/r/anime/search.json', json: { data: { children: [
    { data: { id: 'p', title: 'Show - Episode 5 discussion', author: 'autolovepon', permalink: '/p/p/', num_comments: 3, created_utc: 100 } },
  ] } } }])
  const thread = await client(http).searchReddit(['Show'], 5)
  expect(thread).toMatchObject({ platform: 'reddit', id: 'p', title: 'Show - Episode 5 discussion' })
})

test('getDiscussion isolates a failing provider getComments and still returns other threads', async () => {
  const http = fakeHttp([
    { match: '/api/threads/by-anime', json: { threads: [
      { id: 1, slug: 's', title: 'Ep 5', episode_number: 5, episode_number_end: null, comment_count: 2, created_at: 0, identifier: 'thread-5', url: 'u', forum_shortname: 'f', is_embed: 1, embed_url: 'e' },
    ], has_more: false } },
    { match: 'graphql.anilist.co', json: { data: { Page: { threads: [] } } } },
    { match: '/r/anime/search.json', json: { data: { children: [
      { data: { id: 'p', title: 'Show - Episode 5 discussion', author: 'autolovepon', permalink: '/p/p/', num_comments: 1, created_utc: 100 } },
    ] } } },
    { match: 'api.hayami.moe/anime/search', json: { channel_results: [] } },
    { match: '/anime/21/forum', json: { data: [] } },
    { match: '/comments/p.json', status: 500, json: {} }, // reddit comments fail on BOTH hops
  ])
  const threads = await client(http).getDiscussion({ malId: 21, anilistId: 5, titles: ['Show'], episode: 5 }, { withComments: true })
  const forum = threads.find((t) => t.platform === 'forum')
  const reddit = threads.find((t) => t.platform === 'reddit')
  expect(forum).toBeTruthy()
  expect(reddit?.comments).toEqual([])
})

test('capabilities delegates; unsupported write throws NotSupportedError', async () => {
  const c = client(fakeHttp([]))
  expect(c.capabilities('reddit').downvote).toBe(true)
  expect(c.capabilities('youtube').comment).toBe(false)
  await expect(c.postComment({ platform: 'youtube', id: 'x' }, 'hi')).rejects.toBeInstanceOf(NotSupportedError)
})
