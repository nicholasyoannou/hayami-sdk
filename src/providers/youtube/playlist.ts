import type { Playlist, PlaylistVideo } from './wire'

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Pure. Pick the video for an episode by title regex, else positional fallback. */
export function findVideoInPlaylist(playlist: Playlist | null | undefined, episodeNumber: number): PlaylistVideo | null {
  const videos = playlist?.videos ?? []
  if (!videos.length) return null
  const patterns = [
    new RegExp(`episode\\s+${episodeNumber}\\b`, 'i'),
    new RegExp(`\\bep\\.?\\s*${episodeNumber}\\b`, 'i'),
    new RegExp(`\\be\\s*${episodeNumber}\\b`, 'i'),
    new RegExp(`s\\d+e0*${episodeNumber}\\b`, 'i'),
    new RegExp(`(?<!\\w)#${episodeNumber}\\b`),
  ]
  for (const v of videos) {
    if (patterns.some((re) => re.test(v.title))) return v
  }
  const sorted = [...videos].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  return sorted[episodeNumber - 1] ?? null
}

/** Pure. Pick the best channel's best_match for a generic youtube search. */
export function pickBestChannelResult(data: any, seriesName: string): Playlist | null {
  const results = Array.isArray(data?.channel_results) ? data.channel_results : []
  const target = normalize(seriesName)
  let best: { pl: Playlist; exact: boolean; count: number } | null = null
  for (const ch of results) {
    if (!ch?.has_match || !ch.best_match) continue
    const pl = ch.best_match as Playlist
    const title = normalize(pl.title ?? '')
    const exact = title === target
    const related = exact || (!!title && (title.includes(target) || target.includes(title)))
    if (!related) continue
    const count = pl.videos?.length ?? 0
    if (!best || (exact && !best.exact) || (exact === best.exact && count > best.count)) {
      best = { pl, exact, count }
    }
  }
  return best?.pl ?? null
}
