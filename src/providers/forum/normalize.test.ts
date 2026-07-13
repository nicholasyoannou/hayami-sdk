import { expect, test } from 'vitest'
import { lookupRowToThreadRef, rowToThreadRef } from './normalize'
import type { AnimeThreadRow } from './wire'

const base: AnimeThreadRow = {
  id: 1, slug: 's', title: 't', episode_number: 3, episode_number_end: null,
  comment_count: 12, created_at: 0, identifier: 'thread-42', url: 'https://d.test/t/42', forum_shortname: 'f',
}

test('is_embed=1 → forum platform with embedUrl; id is the identifier', () => {
  const ref = rowToThreadRef({ ...base, is_embed: 1, embed_url: 'https://d.test/embed/42' })
  expect(ref).toEqual({ platform: 'forum', id: 'thread-42', url: 'https://d.test/t/42', episode: 3, commentCount: 12, embedUrl: 'https://d.test/embed/42' })
})

test('is_embed absent → disqus platform, constructed Disqus embedUrl, range end kept', () => {
  const ref = rowToThreadRef({ ...base, episode_number_end: 4 })
  expect(ref.platform).toBe('disqus')
  expect(ref.embedUrl).toBe('https://disqus.com/embed/comments/?base=default&f=f&t_i=thread-42&t_u=https%3A%2F%2Fd.test%2Ft%2F42&t_t=t')
  expect(ref.episodeEnd).toBe(4)
})

test('lookupRowToThreadRef: disqus gets a constructed embedUrl', () => {
  const ref = lookupRowToThreadRef({ id: 1, slug: 's', title: 't', identifier: 'thread-9', url: 'https://d.test/t/9', forum_shortname: 'sub' })
  expect(ref.platform).toBe('disqus')
  expect(ref.embedUrl).toBe('https://disqus.com/embed/comments/?base=default&f=sub&t_i=thread-9&t_u=https%3A%2F%2Fd.test%2Ft%2F9&t_t=t')
})
