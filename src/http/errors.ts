import type { Platform } from '../types'

export class HayamiSdkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

export class HttpError extends HayamiSdkError {
  constructor(message: string, readonly status: number, readonly url: string) {
    super(message)
  }
}

export class RateLimitedError extends HttpError {
  constructor(message: string, status: number, url: string, readonly retryAfterMs?: number) {
    super(message, status, url)
  }
}

export class TimeoutError extends HttpError {
  constructor(url: string, readonly timeoutMs: number) {
    super(`timeout after ${timeoutMs}ms: ${url}`, 0, url)
  }
}

export class AuthRequiredError extends HayamiSdkError {
  constructor(readonly platform: Platform, message = `auth required for ${platform}`) {
    super(message)
  }
}

export class NotSupportedError extends HayamiSdkError {
  constructor(readonly platform: Platform, readonly op: string) {
    super(`${op} not supported for ${platform}`)
  }
}

export class ThreadNotFoundError extends HayamiSdkError {}
