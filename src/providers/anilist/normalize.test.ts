import { expect, test } from 'vitest'
import { normalizeComment, anilistCommentToComment, threadToThreadRef } from './normalize'

test('normalizeComment recurses childComments given as a nested array', () => {
  const raw = { id: 1, comment: 'top', createdAt: 100, likeCount: 2, user: { name: 'a', avatar: { large: 'L' } },
    childComments: [{ id: 2, comment: 'child', createdAt: 101, user: { name: 'b', avatar: { medium: 'M' } } }] }
  const n = normalizeComment(raw)!
  expect(n.id).toBe(1)
  expect(n.user!.avatar).toBe('L')
  expect(n.replies![0]!.id).toBe(2)
  expect(n.replies![0]!.user!.avatar).toBe('M')
})

test('parseChildComments tolerates a JSON string', () => {
  const n = normalizeComment({ id: 1, comment: 'x', childComments: JSON.stringify([{ id: 9, comment: 'y' }]) })!
  expect(n.replies![0]!.id).toBe(9)
})

test('anilistCommentToComment: seconds→ms, markdown→text, no distinguished', () => {
  const c = anilistCommentToComment(normalizeComment({ id: 5, comment: '**hi**', createdAt: 200, likeCount: 3, user: { name: 'u', avatar: { large: 'A' } } })!)
  expect(c).toMatchObject({ platform: 'anilist', id: '5', author: 'u', authorAvatar: 'A', bodyMarkdown: '**hi**', bodyText: 'hi', score: 3, createdAt: 200000 })
  expect(c.distinguished).toBeUndefined()
})

test('threadToThreadRef derives episode from title', () => {
  const ref = threadToThreadRef({ id: 7, title: 'Episode 4 Discussion', replyCount: 12, siteUrl: 'https://anilist.co/forum/thread/7' })
  expect(ref).toMatchObject({ platform: 'anilist', id: '7', url: 'https://anilist.co/forum/thread/7', commentCount: 12, episode: 4 })
})
