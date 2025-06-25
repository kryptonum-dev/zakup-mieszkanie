import { createClient, type QueryParams } from '@sanity/client'
import { isPreviewDeployment } from './is-preview-deployment'

const PROJECT_ID: string = process.env.SANITY_PROJECT_ID || import.meta.env.SANITY_PROJECT_ID
const SANITY_API_TOKEN: string = process.env.SANITY_API_TOKEN || import.meta.env.SANITY_API_TOKEN
const API_VERSION: string = '2025-02-25'

if (isPreviewDeployment && !SANITY_API_TOKEN) {
  console.warn('\x1b[33m%s\x1b[0m', 'The `SANITY_API_TOKEN` environment variable is required.')
}

export const client = createClient({
  projectId: PROJECT_ID,
  dataset: 'production',
  apiVersion: API_VERSION,
  useCdn: false,
  perspective: isPreviewDeployment ? 'drafts' : 'published',
  ...(isPreviewDeployment && { token: SANITY_API_TOKEN }),
})

export default async function sanityFetch<QueryResponse>({
  query,
  params = {},
}: {
  query: string
  params?: QueryParams
}): Promise<QueryResponse> {
  return await client.fetch<QueryResponse>(query, params)
}
``
