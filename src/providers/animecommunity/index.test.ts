import { expect, test } from 'vitest'
import { animecommunityProvider } from './index'
import { DEFAULT_ENDPOINTS } from '../../options'

const ctx = () => ({ endpoints: DEFAULT_ENDPOINTS, log: { debug() {}, warn() {}, error() {} } }) as any

test('resolve builds the tac embed URL from ids + episode', async () => {
  const refs = await animecommunityProvider.resolve({ malId: 52991, anilistId: 154587, episode: 14 }, ctx())
  expect(refs).toHaveLength(1)
  const ref = refs[0]!
  expect(ref.platform).toBe('animecommunity')
  expect(ref.episode).toBe(14)
  expect(ref.embedUrl).toContain('https://hayami.moe/embed/tac?config=')
  const config = JSON.parse(new URL(ref.embedUrl!).searchParams.get('config')!)
  expect(config).toEqual({ MAL_ID: 52991, AniList_ID: 154587, episodeChapterNumber: 14, mediaType: 'anime' })
})

test('resolve returns [] without an id or without an episode', async () => {
  expect(await animecommunityProvider.resolve({ episode: 5 }, ctx())).toEqual([])
  expect(await animecommunityProvider.resolve({ malId: 1 }, ctx())).toEqual([])
})

test('capabilities all false; resolve-only (no getComments)', () => {
  expect(animecommunityProvider.getComments).toBeUndefined()
  expect(animecommunityProvider.capabilities()).toEqual({ comment: false, edit: false, delete: false, vote: false, downvote: false })
})
