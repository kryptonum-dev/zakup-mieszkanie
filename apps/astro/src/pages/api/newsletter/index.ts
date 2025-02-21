export const prerender = false

import { MAILERLITE_API_KEY, REGEX } from '@/global/constants'
import { generateEventIdentifiers } from '@/utils/event-identifiers'
import type { APIRoute } from 'astro'
import type { Props } from './subscribeToNewsletter'

export const POST: APIRoute = async ({ request }) => {
  const { email, name, groupId, legal } = (await request.json()) as Props

  if (!REGEX.email.test(email) || !name || !groupId || !legal)
    return new Response(JSON.stringify({ message: 'Missing required fields', success: false }), { status: 400 })

  try {
    const subscriber = {
      email,
      fields: {
        name: name,
      },
      groups: groupId ? [groupId] : [],
    }
    const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify(subscriber),
    })
    const data = await res.json()
    if (!res.ok) {
      return new Response(
        JSON.stringify({
          message: data.message || 'Failed to subscribe',
          success: false,
        }),
        { status: res.status }
      )
    }

    const { event_id, event_time } = generateEventIdentifiers()
    const conversionData = {
      email,
      eventName: 'Subscribe',
      eventSource: 'website',
      contentName: 'Newsletter Subscription',
      additionalUserData: {
        fn: name,
      },
      additionalCustomData: {
        group_id: groupId,
      },
      event_id,
      event_time,
    }

    try {
      const response = await fetch('/api/meta-conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversionData),
      })

      if (!response.ok) {
        const data = await response.json()
        console.warn('Meta conversion event failed:', data.message)
      }
    } catch (error) {
      console.warn('Failed to send Meta conversion event:', error)
    }

    return new Response(
      JSON.stringify({
        message: 'Successfully subscribed to newsletter',
        success: true,
      }),
      { status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'An error occurred while subscribing',
        success: false,
      }),
      { status: 400 }
    )
  }
}
