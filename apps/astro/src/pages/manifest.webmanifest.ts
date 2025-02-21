export const prerender = true

import icon from '@/assets/icon.png'
import { BACKGROUND_COLOR, DEFAULT_DESCRIPTION, DEFAULT_TITLE, THEME_COLOR } from '@/global/constants'
import type { APIRoute } from 'astro'
import { getImage } from 'astro:assets'

const sizes = [192, 512]

export const GET: APIRoute = async () => {
  try {
    const icons = await Promise.all(
      sizes.map(async (size) => {
        try {
          const {
            src,
            options: { format, width, height },
          } = await getImage({
            src: icon,
            width: size,
            height: size,
            format: 'png',
          })
          return {
            src: src,
            type: `image/${format}`,
            sizes: `${width}x${height}`,
          }
        } catch (error) {
          return {
            src: `/icon-${size}.png`,
            type: 'image/png',
            sizes: `${size}x${size}`,
          }
        }
      })
    )

    const manifest = JSON.stringify({
      start_url: '/',
      display: 'standalone',
      name: DEFAULT_TITLE,
      short_name: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      background_color: BACKGROUND_COLOR,
      theme_color: THEME_COLOR,
      icons,
    })

    return new Response(manifest, {
      headers: { 'Content-Type': 'application/manifest+json' },
    })
  } catch (error) {
    const basicManifest = JSON.stringify({
      start_url: '/',
      display: 'standalone',
      name: DEFAULT_TITLE,
      short_name: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      background_color: BACKGROUND_COLOR,
      theme_color: THEME_COLOR,
      icons: sizes.map((size) => ({
        src: `/icon-${size}.png`,
        type: 'image/png',
        sizes: `${size}x${size}`,
      })),
    })

    return new Response(basicManifest, {
      headers: { 'Content-Type': 'application/manifest+json' },
    })
  }
}
