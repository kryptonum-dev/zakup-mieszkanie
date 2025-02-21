export const prerender = false

import { REGEX, RESEND_API_KEY } from '@/global/constants'
import { generateEventIdentifiers } from '@/utils/event-identifiers'
import { htmlToString } from '@/utils/html-to-string'
import type { APIRoute } from 'astro'
import type { Props } from './sendContactEmail'

export const POST: APIRoute = async ({ request }) => {
  const { email, message, legal, slug } = (await request.json()) as Props

  if (!REGEX.email.test(email) || !message || !legal) {
    return new Response(
      JSON.stringify({
        message: 'Missing required fields',
        success: false,
      }),
      { status: 400 }
    )
  }

  const htmlTemplate = `
    <p>Adres email: <b>${email}</b></p>
    <br />
    <p>${message.trim().replace(/\n/g, '<br />')}</p>
  `
  const textTemplate = htmlToString(htmlTemplate)

  try {
    const res = await fetch(`https://api.resend.com/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Formularz kontaktowy WOODME <formularz@sending.wood-me.pl>',
        to: 'projekty@wood-me.pl',
        reply_to: email,
        subject: `Wiadomość z formularza kontaktowego WOODME`,
        html: htmlTemplate,
        text: textTemplate,
      }),
    })

    if (res.status !== 200) {
      return new Response(
        JSON.stringify({
          message: 'Something went wrong',
          success: false,
        }),
        { status: 400 }
      )
    }

    const userConfirmationTemplate = `
      <p>Witaj ${email},</p>
      <p>Dziękujemy za skontaktowanie się z WOODME. Otrzymaliśmy Twoją wiadomość i wkrótce się z Tobą skontaktujemy.</p>
      <br />
      <p>Z poważaniem,</p>
      <p>Zespół WOODME</p>
    `
    const userConfirmationText = htmlToString(userConfirmationTemplate)

    const userRes = await fetch(`https://api.resend.com/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Formularz kontaktowy WOODME <formularz@sending.wood-me.pl>',
        to: email,
        subject: `Dziękujemy za kontakt z WOODME`,
        html: userConfirmationTemplate,
        text: userConfirmationText,
      }),
    })

    if (userRes.status !== 200) {
      return new Response(
        JSON.stringify({
          message: 'Failed to send confirmation email to user',
          success: false,
        }),
        { status: 400 }
      )
    }

    const { event_id, event_time } = generateEventIdentifiers()
    const conversionData = {
      email,
      eventName: 'Lead',
      eventSource: 'website',
      contentName: 'Contact Form Submission',
      slug,
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
        message: 'Successfully sent message and confirmation email',
        success: true,
      }),
      { status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'An error occurred while sending message',
        success: false,
      }),
      { status: 400 }
    )
  }
}
