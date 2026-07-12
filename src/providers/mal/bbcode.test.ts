import { expect, test } from 'vitest'
import { stripBbcode } from './bbcode'

test('strips bbcode tags but keeps inner text', () => {
  expect(stripBbcode('[b]bold[/b] and [url=http://x]link[/url]')).toBe('bold and link')
  expect(stripBbcode('[quote=User]hi[/quote]')).toBe('hi')
})
