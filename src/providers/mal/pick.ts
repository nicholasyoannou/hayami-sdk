import { extractEpisodeNumbersFromTitle } from '../../episode/episode-utils'
import type { MalForumTopic } from './wire'

export function pickEpisodeTopic(topics: MalForumTopic[] = [], episode?: number): MalForumTopic | null {
  if (!topics.length) return null
  const withNums = topics.map((t) => ({ t, nums: extractEpisodeNumbersFromTitle(t.title) }))

  if (Number.isFinite(episode)) {
    const exact = withNums.find((x) => x.nums.includes(episode!))
    if (exact) return exact.t
    const numbered = withNums.filter((x) => x.nums.length)
    const lower = numbered
      .filter((x) => Math.max(...x.nums) <= episode!)
      .sort((a, b) => Math.max(...b.nums) - Math.max(...a.nums))
    if (lower.length) return lower[0]!.t
    if (numbered.length) {
      return numbered.sort((a, b) =>
        Math.min(...a.nums.map((n) => Math.abs(n - episode!))) - Math.min(...b.nums.map((n) => Math.abs(n - episode!))),
      )[0]!.t
    }
  }
  const firstWithNum = withNums.find((x) => x.nums.length)
  return firstWithNum ? firstWithNum.t : topics[0]!
}
