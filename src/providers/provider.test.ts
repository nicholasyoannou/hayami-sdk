import { expect, test } from 'vitest'
import { buildRegistry, type Provider } from './provider'

const stub = (platforms: Provider['platforms']): Provider => ({
  platforms,
  async resolve() { return [] },
  capabilities: () => ({ comment: false, edit: false, delete: false, vote: false, downvote: false }),
})

test('registry indexes a provider under each of its platforms', () => {
  const forum = stub(['forum', 'disqus'])
  const reg = buildRegistry([forum, stub(['reddit'])])
  expect(reg.get('forum')).toBe(forum)
  expect(reg.get('disqus')).toBe(forum)
  expect(reg.get('reddit')?.platforms).toEqual(['reddit'])
  expect(reg.all().length).toBe(2)
})
