import { llmsFullTxt } from '../site/llms'

export const GET = async () =>
  new Response(await llmsFullTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
