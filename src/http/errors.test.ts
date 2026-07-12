import { expect, test } from 'vitest'
import {
  AuthRequiredError, HayamiSdkError, HttpError, NotSupportedError,
  RateLimitedError, ThreadNotFoundError, TimeoutError,
} from './errors'

test('errors carry structured fields and inherit HayamiSdkError', () => {
  const http = new HttpError('boom', 500, 'https://x.test')
  expect(http).toBeInstanceOf(HayamiSdkError)
  expect(http.status).toBe(500)
  expect(http.url).toBe('https://x.test')

  const auth = new AuthRequiredError('reddit')
  expect(auth.platform).toBe('reddit')
  expect(auth.name).toBe('AuthRequiredError')

  const ns = new NotSupportedError('mal', 'vote')
  expect(ns.op).toBe('vote')

  expect(new RateLimitedError('slow', 429, 'u', 2000).retryAfterMs).toBe(2000)
  expect(new ThreadNotFoundError('none')).toBeInstanceOf(HayamiSdkError)
})

test('TimeoutError is an HttpError with status 0 and timeoutMs', () => {
  const t = new TimeoutError('u', 500)
  expect(t).toBeInstanceOf(HttpError)
  expect(t.status).toBe(0)
  expect(t.timeoutMs).toBe(500)
  expect(t.name).toBe('TimeoutError')
})
