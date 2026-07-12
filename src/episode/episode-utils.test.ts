import { expect, test } from 'vitest'
import { extractEpisodeNumbersFromTitle } from './episode-utils'

test('extracts episode numbers across the common title forms', () => {
  expect(extractEpisodeNumbersFromTitle('Show - Episode 5 discussion')).toEqual([5])
  expect(extractEpisodeNumbersFromTitle('Show Ep. 12')).toEqual([12])
  expect(extractEpisodeNumbersFromTitle('Show S2E3')).toEqual([3])
  expect(extractEpisodeNumbersFromTitle('no numbers here')).toEqual([])
})
