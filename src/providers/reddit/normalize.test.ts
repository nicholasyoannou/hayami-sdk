import { expect, test } from 'vitest'
import { redditCommentToComment, postToThread, postToThreadRef } from './normalize'
import type { RedditComment, RedditPost } from './wire'

test('comment: seconds→ms, moderator→mod, permalink→url, recursive replies', () => {
  const rc: RedditComment = {
    id: 'abc', author: 'u', body: '**hi** >!spoil!<', score: 3, created_utc: 100,
    permalink: '/r/anime/comments/x/_/abc/', distinguished: 'moderator', link_id: 't3_x',
    replies: [{ id: 'def', body: 're', created_utc: 101 }],
    moreChildrenIds: ['g1', 'g2'],
  }
  const c = redditCommentToComment(rc)
  expect(c.createdAt).toBe(100000)
  expect(c.distinguished).toBe('mod')
  expect(c.bodyMarkdown).toBe('**hi** >!spoil!<')
  expect(c.bodyText).toBe('hi spoil')
  expect(c.url).toBe('https://www.reddit.com/r/anime/comments/x/_/abc/')
  expect(c.replies![0]!.id).toBe('def')
  expect(c.moreRepliesCursor).toBe(JSON.stringify({ link: 't3_x', ids: ['g1', 'g2'] }))
})

test('post → Thread and ThreadRef', () => {
  const p: RedditPost = { id: 'p1', title: 'Show - Episode 5 discussion', author: 'autolovepon', permalink: '/r/anime/comments/p1/', score: 99, num_comments: 42, created_utc: 200 }
  expect(postToThread(p)).toMatchObject({ platform: 'reddit', id: 'p1', title: 'Show - Episode 5 discussion', createdAt: 200000, replyCount: 42, score: 99, url: 'https://www.reddit.com/r/anime/comments/p1/' })
  expect(postToThreadRef(p, 5)).toMatchObject({ platform: 'reddit', id: 'p1', episode: 5, commentCount: 42 })
})
