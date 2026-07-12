import { expect, test } from 'vitest'
import { MemoryCache } from './memory-cache'

test('stores and returns values', async () => {
  const c = new MemoryCache()
  await c.set('a', 1)
  expect(await c.get('a')).toBe(1)
  expect(await c.get('missing')).toBeUndefined()
})

test('honours ttl using an injected clock', async () => {
  let now = 1000
  const c = new MemoryCache(() => now)
  await c.set('a', 1, 50)
  now = 1049
  expect(await c.get('a')).toBe(1)
  now = 1051
  expect(await c.get('a')).toBeUndefined()
})
