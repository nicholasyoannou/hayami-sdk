import { expect, test } from 'vitest'
import { malPostToComment, topicToThreadRef } from './normalize'

test('post → Comment: ISO date via Date.parse, BBCode→text, avatar typo alias, flair=forum_title', () => {
  const c = malPostToComment({
    id: 10, created_at: '2024-01-02T03:04:05+00:00', body: '[b]hi[/b]',
    author: { name: 'u', forum_title: 'Veteran', forum_avator: 'https://cdn/av.png' },
  })
  expect(c).toMatchObject({ platform: 'mal', id: '10', author: 'u', bodyMarkdown: '[b]hi[/b]', bodyText: 'hi', flair: 'Veteran', authorAvatar: 'https://cdn/av.png' })
  expect(c.createdAt).toBe(Date.parse('2024-01-02T03:04:05+00:00'))
  expect(c.replies).toBeUndefined() // MAL posts are flat
})

test('default kaomoji avatar is treated as no avatar', () => {
  const c = malPostToComment({ id: 1, author: { name: 'u', forum_avatar: 'https://cdn/images/kaomoji_mal_white.png' } })
  expect(c.authorAvatar).toBeUndefined()
})

test('topic → ThreadRef with episode + commentCount', () => {
  const ref = topicToThreadRef({ id: 5, title: 'Episode 3 Discussion', comments: 20, url: 'https://myanimelist.net/forum/?topicid=5' })
  expect(ref).toMatchObject({ platform: 'mal', id: '5', commentCount: 20, episode: 3, url: 'https://myanimelist.net/forum/?topicid=5' })
})
