import { expect, test } from 'vitest'
import { anilistQuery } from './client'
import { createRequester } from '../../http/requester'
import { fakeHttp } from '../../testing/fake-http'
import { DEFAULT_ENDPOINTS } from '../../options'
import { AuthRequiredError } from '../../http/errors'

const ctx = (http: ReturnType<typeof fakeHttp>, getToken?: any) => ({
  request: createRequester({ http, getToken }), endpoints: DEFAULT_ENDPOINTS,
  getToken, log: { debug() {}, warn() {}, error() {} },
})

test('POSTs {query,variables} and returns response.data', async () => {
  const http = fakeHttp([{ match: 'graphql.anilist.co', json: { data: { Page: { threads: [] } } } }])
  const data = await anilistQuery(ctx(http), 'query{}', { page: 1 })
  expect(data).toEqual({ Page: { threads: [] } })
  expect(http.calls[0]!.method).toBe('POST')
  expect(JSON.parse(http.calls[0]!.body!)).toEqual({ query: 'query{}', variables: { page: 1 } })
})

test('auth:true without a token throws before calling', async () => {
  const http = fakeHttp([])
  await expect(anilistQuery(ctx(http), 'mutation{}', {}, { auth: true })).rejects.toBeInstanceOf(AuthRequiredError)
  expect(http.calls.length).toBe(0)
})
