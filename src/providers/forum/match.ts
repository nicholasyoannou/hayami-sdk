import { extractEpisodeNumbersFromTitle } from '../../episode/episode-utils'
import type { AnimeThreadRow } from './wire'

export interface MatchInput {
  episodeCandidates: Array<number | null | undefined>
  episodeNameHint?: string | null
  isMovie?: boolean
}

function covers(row: AnimeThreadRow, ep: number): boolean {
  if (row.episode_number == null) return false
  const end = row.episode_number_end ?? row.episode_number
  return ep >= row.episode_number && ep <= end
}

/** Ported priority: movie → exact/range (caller order) → title-hint → lower-or-equal → single-thread. */
export function matchEpisodeThread(threads: AnimeThreadRow[], input: MatchInput): AnimeThreadRow | null {
  if (!threads.length) return null
  if (input.isMovie) return threads.find((r) => r.episode_number == null) ?? null

  const candidates: number[] = []
  for (const raw of input.episodeCandidates) {
    if (raw == null) continue
    const n = typeof raw === 'number' ? raw : Number(raw)
    if (!Number.isFinite(n) || n <= 0) continue
    if (!candidates.includes(n)) candidates.push(n)
  }

  for (const ep of candidates) {
    const hit = threads.find((r) => covers(r, ep))
    if (hit) return hit
  }

  if (input.episodeNameHint) {
    for (const ep of extractEpisodeNumbersFromTitle(input.episodeNameHint)) {
      const tm = threads.find((r) => extractEpisodeNumbersFromTitle(r.title).includes(ep))
      if (tm) return tm
    }
  }

  const numbered = threads.filter((r) => r.episode_number != null)
  if (numbered.length && candidates.length) {
    const smallest = Math.min(...candidates)
    const lower = numbered
      .filter((r) => (r.episode_number_end ?? r.episode_number!) <= smallest)
      .sort((a, b) => (b.episode_number_end ?? b.episode_number!) - (a.episode_number_end ?? a.episode_number!))
    if (lower.length) return lower[0]!
  }

  if (threads.length === 1 && (!candidates.length || threads[0]!.episode_number == null)) return threads[0]!
  return null
}
