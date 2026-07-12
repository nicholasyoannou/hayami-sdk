# hayami-sdk

Headless library for mapping and fetching anime episode
discussions across Reddit, AniList, MyAnimeList, YouTube, and the Chuunime (Disqus)
forum. This is intended for use in a variety of settings, bringing community discussions to more places. This is stripped of UI/styling, sourced from the Hayami extension.

All network goes through an `HttpAdapter`, intended for JS runtime.

## Provide an HttpAdapter
```ts
import { createDiscussionClient, type HttpAdapter } from '@nicholasyoannou/hayami-sdk'

const http: HttpAdapter = async (url, init) => {
  const r = await invoke('ext_fetch', { url, method: init?.method ?? 'GET', headers: init?.headers, body: init?.body })
  return { ok: r.status < 300, status: r.status, headers: r.headers, text: async () => r.body, json: async () => JSON.parse(r.body) }
}

const client = createDiscussionClient({
  http,
  mapperBaseUrl: 'https://discussanime.moe',        // configurable
  getToken: (p) => tokens[p],                         // per-platform bearer, optional
})
```

## Use it
```ts
const refs = await client.resolve({ anilistId: 123, malId: 21, titles: ['Frieren'], episode: 5 })
const comments = await client.getComments(refs[0])
const threads = await client.getDiscussion({ titles: ['Frieren'], episode: 5 }, { sources: ['reddit'], withComments: true })
const redditThread = await client.searchReddit(['Frieren'], 5) // mapper-free

// write (needs getToken)
await client.postComment({ platform: 'reddit', id: 'post1' }, 'nice episode')
await client.vote({ platform: 'reddit', id: 'commentId' }, 1)
```

## Or import only the providers you need
```ts
import { redditProvider } from '@nicholasyoannou/hayami-sdk/reddit' // pulls only reddit
```

## Comments return both markdown and plain text
Every `Comment` has `bodyMarkdown` and a pre-stripped `bodyText` (safe to render
without an HTML sanitizer).

## Capabilities
| Platform | resolve | getComments | comment | edit | delete | vote | downvote |
|---|---|---|---|---|---|---|---|
| reddit | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| anilist | ✓ | ✓ | ✓ | ✓ | — | ✓ (like) | — |
| mal | ✓ | ✓ (needs `getToken('mal')`) | — | — | — | — | — |
| youtube | ✓ | ✓ (needs `youtubeApiKey` or `getToken('youtube')`) | — | — | — | — | — |
| forum / disqus | ✓ | — (iframe embed) | — | — | — | — | — |

Call `client.capabilities(platform)` before a write; unsupported ops throw
`NotSupportedError`, missing tokens throw `AuthRequiredError`.