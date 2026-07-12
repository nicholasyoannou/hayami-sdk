import type { HttpAdapter, RequesterResponse } from '../options'

export interface FakeRoute {
  match: string | ((url: string, init?: { method?: string; body?: string }) => boolean)
  status?: number
  headers?: Record<string, string>
  json?: unknown
  text?: string
}

export interface FakeHttp extends HttpAdapter {
  calls: Array<{ url: string; method: string; headers?: Record<string, string>; body?: string }>
}

export function fakeHttp(routes: FakeRoute[]): FakeHttp {
  const calls: FakeHttp['calls'] = []
  const adapter = (async (url, init) => {
    calls.push({ url, method: init?.method ?? 'GET', headers: init?.headers, body: init?.body })
    const route = routes.find((r) =>
      typeof r.match === 'string' ? url.includes(r.match) : r.match(url, init),
    )
    if (!route) {
      return resp(404, {}, '')
    }
    const bodyText = route.text ?? (route.json !== undefined ? JSON.stringify(route.json) : '')
    return resp(route.status ?? 200, route.headers ?? {}, bodyText)
  }) as FakeHttp
  adapter.calls = calls
  return adapter
}

function resp(status: number, headers: Record<string, string>, body: string): RequesterResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers,
    text: async () => body,
    json: async () => (body ? JSON.parse(body) : null),
  }
}
