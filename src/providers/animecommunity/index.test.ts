import { expect, test } from 'vitest'
import { animecommunityProvider } from './index'
import { DEFAULT_ENDPOINTS } from '../../options'

const ctx = () => ({ endpoints: DEFAULT_ENDPOINTS, log: { debug() {}, warn() {}, error() {} } }) as any

test('resolve returns a script-embed descriptor with the TAC config', async () => {
  const refs = await animecommunityProvider.resolve({ malId: 52991, anilistId: 154587, episode: 14 }, ctx())
  expect(refs).toHaveLength(1)
  const ref = refs[0]!
  expect(ref.platform).toBe('animecommunity')
  expect(ref.episode).toBe(14)
  expect(ref.embedUrl).toBeUndefined()
  expect(ref.scriptEmbed).toEqual({
    scriptSrc: 'https://theanimecommunity.com/embed.js',
    scriptId: 'anime-community-script',
    containerId: 'anime-community-comment-section',
    configVar: 'theAnimeCommunityConfig',
    config: { episodeChapterNumber: 14, mediaType: 'anime', MAL_ID: 52991, AniList_ID: 154587 },
  })
})

test('config omits the id that is absent; needs one id + an episode', async () => {
  const onlyAniList = (await animecommunityProvider.resolve({ anilistId: 5, episode: 2 }, ctx()))[0]!
  expect(onlyAniList.scriptEmbed!.config).toEqual({ episodeChapterNumber: 2, mediaType: 'anime', AniList_ID: 5 })
  expect((onlyAniList.scriptEmbed!.config as any).MAL_ID).toBeUndefined()

  expect(await animecommunityProvider.resolve({ episode: 5 }, ctx())).toEqual([])
  expect(await animecommunityProvider.resolve({ malId: 1 }, ctx())).toEqual([])
})

test('capabilities all false; resolve-only', () => {
  expect(animecommunityProvider.getComments).toBeUndefined()
  expect(animecommunityProvider.capabilities()).toEqual({ comment: false, edit: false, delete: false, vote: false, downvote: false })
})
