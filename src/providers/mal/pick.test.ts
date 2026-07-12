import { expect, test } from 'vitest'
import { pickEpisodeTopic } from './pick'
import type { MalForumTopic } from './wire'

const t = (id: number, title: string): MalForumTopic => ({ id, title })

test('exact episode match wins', () => {
  const topics = [t(1, 'Episode 4 Discussion'), t(2, 'Episode 5 Discussion')]
  expect(pickEpisodeTopic(topics, 5)?.id).toBe(2)
})

test('no episode arg → first topic containing any episode number', () => {
  expect(pickEpisodeTopic([t(1, 'General'), t(2, 'Episode 3')], undefined)?.id).toBe(2)
})

test('empty → null', () => {
  expect(pickEpisodeTopic([], 1)).toBeNull()
})
