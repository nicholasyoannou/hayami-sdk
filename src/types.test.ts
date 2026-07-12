import { expect, test } from 'vitest'
import { PLATFORMS, type Platform } from './types'

test('PLATFORMS lists every platform exactly once', () => {
  expect([...PLATFORMS].sort()).toEqual(
    ['anilist', 'disqus', 'forum', 'mal', 'reddit', 'youtube'],
  )
})

test('Platform type accepts a known value', () => {
  const p: Platform = 'reddit'
  expect(PLATFORMS.includes(p)).toBe(true)
})
