import { expect, test } from 'vitest'
import { matchEpisodeThread } from './match'
import type { AnimeThreadRow } from './wire'

const row = (over: Partial<AnimeThreadRow>): AnimeThreadRow => ({
  id: 1, slug: 's', title: 't', episode_number: null, episode_number_end: null,
  comment_count: 0, created_at: 0, identifier: 'thread-1', url: 'u', forum_shortname: 'f', ...over,
})

test('exact/range match wins in caller candidate order', () => {
  const threads = [row({ id: 1, episode_number: 4 }), row({ id: 2, episode_number: 1, episode_number_end: 2 })]
  expect(matchEpisodeThread(threads, { episodeCandidates: [2] })?.id).toBe(2)
})

test('falls back to highest lower-or-equal, never forward', () => {
  const threads = [row({ id: 4, episode_number: 4 }), row({ id: 5, episode_number: 5 })]
  expect(matchEpisodeThread(threads, { episodeCandidates: [1] })).toBeNull()
  expect(matchEpisodeThread([row({ id: 3, episode_number: 3 }), row({ id: 5, episode_number: 5 })], { episodeCandidates: [6] })?.id).toBe(5)
})

test('movie short-circuits to the null-episode thread', () => {
  const threads = [row({ id: 9, episode_number: null }), row({ id: 1, episode_number: 1 })]
  expect(matchEpisodeThread(threads, { episodeCandidates: [1], isMovie: true })?.id).toBe(9)
})
