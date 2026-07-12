import { expect, test } from 'vitest'
import { stripMarkdown } from './strip'

test('empty / nullish input → empty string', () => {
  expect(stripMarkdown('')).toBe('')
  expect(stripMarkdown(undefined)).toBe('')
  expect(stripMarkdown(null)).toBe('')
})

test('decodes entities and strips html tags', () => {
  expect(stripMarkdown('a &amp; <b>b</b> &lt;c&gt;')).toBe('a & b <c>')
})

test('links and images reduce to their text', () => {
  expect(stripMarkdown('see [the docs](https://x.test)')).toBe('see the docs')
  expect(stripMarkdown('![alt text](img.png)')).toBe('alt text')
})

test('reddit spoiler markers are removed but content kept', () => {
  expect(stripMarkdown('>!big twist!<')).toBe('big twist')
})

test('emphasis, headings, quotes and list markers are stripped', () => {
  expect(stripMarkdown('# Title')).toBe('Title')
  expect(stripMarkdown('**bold** and _em_')).toBe('bold and em')
  expect(stripMarkdown('> quoted')).toBe('quoted')
  expect(stripMarkdown('- one\n- two')).toBe('one\ntwo')
})

test('preserves comparison operators in prose', () => {
  expect(stripMarkdown('power level <9000, now >9000')).toBe('power level <9000, now >9000')
  expect(stripMarkdown('score 9 <10 vs 8>10')).toBe('score 9 <10 vs 8>10')
})
