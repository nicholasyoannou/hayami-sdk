import { expect, test } from 'vitest'
import { byAnimeUrl, lookupUrl } from './wire'

test('lookupUrl prefers mal_id and encodes episode params', () => {
  expect(lookupUrl('https://m.test', { malId: 21, episodeNumber: 5 }))
    .toBe('https://m.test/api/threads/lookup?mal_id=21&episode_number=5')
  expect(lookupUrl('https://m.test', { anilistId: 99, isMovie: true }))
    .toBe('https://m.test/api/threads/lookup?anilist_id=99&movie=1')
})

test('byAnimeUrl appends episode hint + window and page/limit', () => {
  expect(byAnimeUrl('https://m.test', { malId: 21, episodeHint: 5, limit: 50, page: 1 }))
    .toBe('https://m.test/api/threads/by-anime?mal_id=21&episode=5&episode_window=30&limit=50&page=1')
})
