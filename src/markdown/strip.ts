const ENTITIES: Array<[RegExp, string]> = [
  [/&amp;/g, '&'],
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&quot;/g, '"'],
  [/&#0?39;|&apos;/g, "'"],
]

/**
 * Convert markdown / lightly-HTML comment bodies into safe plain text with NO
 * DOM. Mirrors EXT/markdown.ts: normalize CRLF, decode entities, preserve
 * reddit spoiler content while dropping the `>!`/`!<` markers, then strip
 * markdown syntax and any residual HTML tags.
 */
export function stripMarkdown(input: string | undefined | null): string {
  if (!input) return ''
  let s = String(input).replace(/\r\n/g, '\n')
  s = s.replace(/<\/?[a-zA-Z][\w-]*(?:\s[^<>]*)?>/g, '') // real html tags (must run
  // before entity-decode, otherwise decoded `&lt;x&gt;` sequences would be
  // mistaken for tags). Requiring tag-like structure keeps bare `<`/`>`
  // comparison operators in prose intact.
  for (const [re, to] of ENTITIES) s = s.replace(re, to)
  s = s.replace(/>!/g, '').replace(/!</g, '')
  s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images → alt
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
  s = s.replace(/```+/g, '').replace(/`/g, '') // code fences / inline
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, '') // headings
  s = s.replace(/^\s{0,3}>\s?/gm, '') // blockquotes
  s = s.replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, '') // list markers
  s = s.replace(/\*\*|\*|__|_|~~|~/g, '') // emphasis / strikethrough
  s = s.replace(/\n{3,}/g, '\n\n').trim()
  return s
}
