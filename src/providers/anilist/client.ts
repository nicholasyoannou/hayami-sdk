import type { ProviderCtx } from '../provider'

/** Single POST to graphql.anilist.co. Bearer attached when a token exists; auth:true requires one. */
export async function anilistQuery<T = any>(
  ctx: ProviderCtx,
  query: string,
  variables: Record<string, unknown>,
  opts: { auth?: boolean } = {},
): Promise<T> {
  const body = await ctx.request.json<{ data?: T; errors?: Array<{ message: string }> }>(
    ctx.endpoints.anilist,
    {
      method: 'POST',
      platform: 'anilist',
      auth: opts.auth,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
    },
  )
  if (body.errors?.length) throw new Error(`anilist: ${body.errors[0]!.message}`)
  return body.data as T
}
