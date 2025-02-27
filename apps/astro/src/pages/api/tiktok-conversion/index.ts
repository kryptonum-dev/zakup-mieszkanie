import { DOMAIN } from '@global/constants'
import { hash } from '@utils/hash'
import { getPageAnalyticsData } from '@utils/page-data'
import type { APIRoute } from 'astro'

type UserData = {
  name?: string
  email?: string
  eventName: string
  slug?: string
  event_id: string
  event_time: number
  url: string
  content_id?: string
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const userData = (await request.json()) as UserData
    const { name, email, eventName, slug, event_id, event_time, content_id } = userData

    if (!slug) {
      return new Response(
        JSON.stringify({
          message: 'Slug is required',
          success: false,
        }),
        { status: 400 }
      )
    }

    const { analytics } = await getPageAnalyticsData(slug)

    if (!analytics.tiktok?.pixelId || !analytics.tiktok?.accessToken) {
      return new Response(
        JSON.stringify({
          message: 'TikTok analytics credentials not found',
          success: false,
        }),
        { status: 400 }
      )
    }

    const cookies =
      request.headers
        .get('cookie')
        ?.split(';')
        .reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split('=')
            acc[key] = value
            return acc
          },
          {} as Record<string, string>
        ) || {}

    const cookieConsent = cookies['cookie-consent']
    if (!cookieConsent) {
      return new Response(
        JSON.stringify({
          message: 'No cookie consent found',
          success: false,
        }),
        { status: 400 }
      )
    }

    const consentSettings = JSON.parse(decodeURIComponent(cookieConsent))
    if (consentSettings.conversion_api !== 'granted') {
      return new Response(
        JSON.stringify({
          message: 'Conversion API consent not granted',
          success: false,
        }),
        { status: 400 }
      )
    }

    const client_ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const client_user_agent = request.headers.get('user-agent')
    const referer = request.headers.get('referer')

    const response = await fetch(`https://business-api.tiktok.com/open_api/v1.3/pixel/track/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': analytics.tiktok.accessToken,
      },
      body: JSON.stringify({
        event_source_id: analytics.tiktok.pixelId,
        event: eventName,
        test_event_code: 'TEST66822',
        pixel_code: analytics.tiktok.pixelId,
        data: [
          {
            event: eventName,
            event_time,
            event_id,
            user: {
              ...(name && { name: name }),
              ...(email && { email: await hash(email) }),
              ip: client_ip_address,
              user_agent: client_user_agent,
            },
            page: {
              url: `${DOMAIN}${slug}`,
              referrer: referer,
            },
          },
        ],
      }),
    })

    const res = await response.json()

    console.log(res)

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          message: 'Failed to send TikTok conversion event',
          success: false,
        }),
        { status: response.status }
      )
    }

    return new Response(
      JSON.stringify({
        message: 'Successfully sent TikTok conversion event',
        success: true,
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in tiktok-conversion API:', error)
    return new Response(
      JSON.stringify({
        message: 'An error occurred while processing the TikTok conversion event',
        success: false,
      }),
      { status: 500 }
    )
  }
}
