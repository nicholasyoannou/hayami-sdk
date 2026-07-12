import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

test('reddit provider index does not statically import sibling providers', () => {
  const src = readFileSync('src/providers/reddit/index.ts', 'utf8')
  expect(src).not.toMatch(/providers\/(youtube|anilist|mal|forum)/)
})
