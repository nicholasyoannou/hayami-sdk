import { expect, test } from 'vitest'
import { youtubeProvider } from './index'
import { createRequester } from '../../http/requester'
import { fakeHttp } from '../../testing/fake-http'
import { DEFAULT_ENDPOINTS } from '../../options'

const ctx = (http: ReturnType<typeof fakeHttp>) => ({
  request: createRequester({ http }), endpoints: DEFAULT_ENDPOINTS,
  log: { debug() {}, warn() {}, error() {} },
})

test('resolve maps a mapped playlist video to a youtube ThreadRef', async () => {
  const http = fakeHttp([{ match: 'api.hayami.moe/anime/search', json: { channel_results: [
    { has_match: true, channel_name: 'Muse', channel_id: 'c1', platform: 'youtube', best_match: { title: 'Frieren', videos: [{ video_id: 'vid5', title: 'Frieren Episode 5', position: 4 }] } },
  ] } }])
  const refs = await youtubeProvider.resolve({ titles: ['Frieren'], episode: 5 }, ctx(http))
  expect(refs[0]).toMatchObject({ platform: 'youtube', id: 'vid5', url: 'https://www.youtube.com/watch?v=vid5', embedUrl: 'https://www.youtube.com/embed/vid5', episode: 5 })
})

test('getComments maps commentThreads to normalized comments (ISO→ms, plaintext body)', async () => {
  const http = fakeHttp([{ match: '/commentThreads', json: { items: [
    { id: 't1', snippet: { totalReplyCount: 0, topLevelComment: { snippet: { authorDisplayName: 'u', authorProfileImageUrl: 'av', textDisplay: 'hi', likeCount: 2, publishedAt: '2024-01-02T00:00:00Z' } } } },
  ] } }])
  const comments = await youtubeProvider.getComments!({ platform: 'youtube', id: 'vid5' }, ctx(http))
  expect(comments[0]).toMatchObject({ platform: 'youtube', id: 't1', author: 'u', authorAvatar: 'av', bodyText: 'hi', bodyMarkdown: 'hi', score: 2, createdAt: Date.parse('2024-01-02T00:00:00Z') })
})

test('capabilities: youtube read-only', () => {
  expect(youtubeProvider.capabilities()).toEqual({ comment: false, edit: false, delete: false, vote: false, downvote: false })
})
