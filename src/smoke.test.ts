import { expect, test } from 'vitest'
import { SDK_NAME } from './index'

test('package exposes its name', () => {
  expect(SDK_NAME).toBe('@nicholasyoannou/hayami-sdk')
})
