import type { APIRoute } from 'astro'
import { hash } from '@utils/hash'
import { getPageAnalyticsData } from '@utils/page-data'

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

    if (!analytics.metaPixelId || !analytics.metaConversionToken) {
      return new Response(
        JSON.stringify({
          message: 'Analytics credentials not found',
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

    const advancedMatchingConsent = consentSettings.advanced_matching || 'denied'

    const client_ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const client_user_agent = request.headers.get('user-agent')
    const referer = request.headers.get('referer')

    const fbc = cookies._fbc
    const fbp = cookies._fbp

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${analytics.metaPixelId}/events?access_token=${analytics.metaConversionToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            {
              event_id,
              event_name: eventName,
              event_time,
              action_source: eventSource,
              event_source_url: referer,
              user_data: {
                ...(advancedMatchingConsent === 'granted'
                  ? {
                    client_ip_address,
                    client_user_agent,
                    ...(email && { em: await hash(email) }),
                    ...(name && { fn: name }),
                    ...(fbc && { fbc }),
                    ...(fbp && { fbp }),
                  }
                  : {}),
                ...additionalUserData,
              },
              custom_data: {
                content_name: contentName,
                advanced_matching_consent: advancedMatchingConsent,
                ...additionalData,
                ...additionalCustomData,
              },
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          message: 'Failed to send conversion event',
          success: false,
        }),
        { status: response.status }
      )
    }

    return new Response(
      JSON.stringify({
        message: 'Successfully sent conversion event',
        success: true,
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in meta-conversion API:', error)
    return new Response(
      JSON.stringify({
        message: 'An error occurred while processing the conversion event',
        success: false,
      }),
      { status: 500 }
    )
  }
}
