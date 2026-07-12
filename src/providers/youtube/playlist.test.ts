import { expect, test } from 'vitest'
import { findVideoInPlaylist } from './playlist'

test('matches episode by title, else positional fallback', () => {
  const pl = { videos: [
    { video_id: 'a', title: 'Show Episode 1', position: 0 },
    { video_id: 'b', title: 'Show Episode 2', position: 1 },
  ] }
  expect(findVideoInPlaylist(pl, 2)?.video_id).toBe('b')
  expect(findVideoInPlaylist({ videos: [{ video_id: 'x', title: 'no num', position: 0 }] }, 1)?.video_id).toBe('x')
})
