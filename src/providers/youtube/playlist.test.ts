import { expect, test } from 'vitest'
import { findVideoInPlaylist, pickBestChannelResult } from './playlist'

test('matches episode by title, else positional fallback', () => {
  const pl = { videos: [
    { video_id: 'a', title: 'Show Episode 1', position: 0 },
    { video_id: 'b', title: 'Show Episode 2', position: 1 },
  ] }
  expect(findVideoInPlaylist(pl, 2)?.video_id).toBe('b')
  expect(findVideoInPlaylist({ videos: [{ video_id: 'x', title: 'no num', position: 0 }] }, 1)?.video_id).toBe('x')
})

test('pickBestChannelResult skips unrelated candidates (no wrong-anime match)', () => {
  const data = { channel_results: [
    { has_match: true, best_match: { title: 'Completely Different Show', videos: [
      { video_id: 'a', title: 'x' }, { video_id: 'b', title: 'y' }, { video_id: 'c', title: 'z' },
    ] } },
  ] }
  expect(pickBestChannelResult(data, 'Frieren')).toBeNull()
})

test('pickBestChannelResult returns a related-title playlist', () => {
  const data = { channel_results: [
    { has_match: true, best_match: { title: 'Frieren Beyond Journey', videos: [{ video_id: 'v', title: 'Frieren Episode 1' }] } },
  ] }
  expect(pickBestChannelResult(data, 'Frieren')?.videos[0]!.video_id).toBe('v')
})
