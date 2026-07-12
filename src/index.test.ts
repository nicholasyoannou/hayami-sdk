import { expect, test } from 'vitest'
import { createDiscussionClient, MemoryCache } from './index'
import * as Types from './index'

test('index re-exports the client factory + core helpers + types', () => {
  expect(typeof createDiscussionClient).toBe('function')
  expect(typeof MemoryCache).toBe('function')
  expect(Types.PLATFORMS).toContain('reddit')
})
