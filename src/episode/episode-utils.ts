/**
 * Scan a thread/episode title for episode numbers. Returns them in first-seen
 * order, de-duped. Ported unchanged from EXT/episode-utils.ts.
 */
export function extractEpisodeNumbersFromTitle(title?: string): number[] {
  if (!title) return []
  const patterns = [/episode\s*(\d+)/gi, /\bep\.?\s*(\d+)/gi, /\be\.?\s*(\d+)/gi, /s\d+e(\d+)/gi]
  const found = new Set<number>()
  for (const re of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(title)) !== null) {
      const n = Number(m[1])
      if (Number.isFinite(n) && n > 0) found.add(n)
    }
  }
  return Array.from(found)
}

/** First episode number as a string, or null. Ported from EXT/episode-utils.ts. */
export function extractEpisodeNumber(episodeName: string): string | null {
  const nums = extractEpisodeNumbersFromTitle(episodeName)
  return nums.length ? String(nums[0]) : null
}
