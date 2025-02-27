import { hash } from '@utils/hash'
import { getPageAnalyticsData } from '@utils/page-data'
import type { APIRoute } from 'astro'

type UserData = {
  name?: string
  email?: string
  eventName: string
  eventSource: string
  contentName: string
  additionalUserData?: Record<string, string>
  additionalCustomData?: Record<string, any>
  slug?: string
  event_id: string
  event_time: number
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const userData = (await request.json()) as UserData
    const {
      name,
      email,
      eventName,
      eventSource,
      contentName,
      additionalUserData,
      additionalCustomData,
      slug,
      event_id,
      event_time,
    } = userData

    if (!slug) {
      return new Response(
        JSON.stringify({
          message: 'Slug is required',
          success: false,
        }),
        { status: 400 }
      )
    }

    const { analytics, additionalData } = await getPageAnalyticsData(slug)

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
        pixel_code: analytics.tiktok.pixelId,
        event: eventName,
        event_id,
        timestamp: event_time,
        context: {
          page: {
            url: referer,
          },
          user: {
            ...(name && { name: name }),
            ...(email && { email: await hash(email) }),
            external_id: event_id,
            ip: client_ip_address,
            user_agent: client_user_agent,
            ...additionalUserData,
          },
          ad: {
            callback: event_id,
          },
        },
        properties: {
          contents: [
            {
              content_type: contentName,
              content_id: slug,
            },
          ],
          ...additionalData,
          ...additionalCustomData,
        },
      }),
    })

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
