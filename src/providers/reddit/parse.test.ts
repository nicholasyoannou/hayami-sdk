import { expect, test } from 'vitest'
import { parseComments } from './parse'

test('keeps only t1 children, strips t1_ prefix, recurses replies', () => {
  const children = [
    { kind: 't1', data: {
      name: 't1_abc', author: 'u1', body: 'hi', score: 4, created_utc: 100, permalink: '/r/anime/comments/x/_/abc/',
      replies: { kind: 'Listing', data: { children: [
        { kind: 't1', data: { name: 't1_def', author: 'u2', body: 're', score: 1, created_utc: 101 } },
        { kind: 'more', data: { count: 3, children: ['g1', 'g2'] } },
      ] } },
    } },
    { kind: 'more', data: { count: 5, children: ['top1'] } },
  ]
  const out = parseComments(children)
  expect(out).toHaveLength(1)
  expect(out[0]!.id).toBe('abc')
  expect(out[0]!.replies![0]!.id).toBe('def')
  expect(out[0]!.moreChildrenIds).toEqual(['g1', 'g2'])
  expect(out[0]!.moreCount).toBe(3)
})

test('empty-string replies are ignored', () => {
  const out = parseComments([{ kind: 't1', data: { name: 't1_a', body: 'x', replies: '' } }])
  expect(out[0]!.replies).toBeUndefined()
})
