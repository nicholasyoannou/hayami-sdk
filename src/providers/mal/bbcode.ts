/** DOM-free BBCode → plain text. The extension's bbcodeToHtml is DOM-coupled and is NOT ported. */
export function stripBbcode(input: string | undefined | null): string {
  if (!input) return ''
  return String(input)
    .replace(/\[(\w+)(=[^\]]*)?\]/gi, '') // opening tags incl. [url=...]
    .replace(/\[\/(\w+)\]/gi, '') // closing tags
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
