import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return walk(full)
    return full.endsWith('.ts') && !full.endsWith('.test.ts') ? [full] : []
  })
}

const BANNED = [/\bbrowser\./, /\bchrome\./, /\bwindow\./, /\bdocument\./, /\bDOMParser\b/, /\bfetch\s*\(/]

test('no source file references browser/DOM/global fetch', () => {
  const offenders: string[] = []
  for (const file of walk('src')) {
    const text = readFileSync(file, 'utf8')
    for (const re of BANNED) {
      if (re.test(text)) offenders.push(`${file} :: ${re}`)
    }
  }
  expect(offenders).toEqual([])
})
