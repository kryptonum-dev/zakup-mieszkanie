import type { ComponentProps } from 'astro/types'
import Head from '@layout/Head.astro'
import sanityFetch from './sanity.fetch'

type Props = ComponentProps<typeof Head>

export default async function metadataFetch(slug: string): Promise<Props> {
  const seo = await sanityFetch<Props>({
    query: /* groq */ `
      *[slug.current == $slug][0] {
        "path": slug.current,
        "title": seo.title,
        "description": seo.description,
        "openGraphImage": seo.img.asset -> url + "?w=1200",
      }
    `,
    params: { slug },
  })
  if (!seo?.path) throw new Error(`Missing required field \`path\` for slug \`${slug}\``)
  if (!seo?.title) throw new Error(`Missing required field \`title\` for slug \`${slug}\``)
  if (!seo?.description) throw new Error(`Missing required field \`description\` for slug \`${slug}\``)
  return seo
}
