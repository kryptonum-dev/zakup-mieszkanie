import { REGEX } from '@global/constants'
import { generateEventIdentifiers } from '@utils/event-identifiers'
import { htmlToString } from '@utils/html-to-string'
import { getPageAnalyticsData } from '@utils/page-data'
import type { APIRoute } from 'astro'
import type { Props } from './sendContactEmail'

const RESEND_API_KEY: string = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY

export const POST: APIRoute = async ({ request }) => {
  const { name, email, message, legal, slug } = (await request.json()) as Props

  if (!REGEX.email.test(email) || !message || !legal || !name) {
    return new Response(
      JSON.stringify({
        message: 'Missing required fields',
        success: false,
      }),
      { status: 400 }
    )
  }

  const htmlTemplate = `
    <p>Imię: <b>${name}</b></p>
    <p>Adres email: <b>${email}</b></p>
    <br />
    <p>${message.trim().replace(/\n/g, '<br />')}</p>
  `

  try {
    const res = await fetch(`https://api.resend.com/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Formularz kontaktowy Zakup Mieszkanie <formularz@sending.zakupmieszkanie.pl>',
        to: 'admin@zakupmieszkanie.pl',
        reply_to: email,
        subject: 'Wiadomość z formularza kontaktowego Zakup Mieszkanie',
        html: htmlTemplate,
        text: htmlToString(htmlTemplate),
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
      <p>Witaj ${name},</p>
      <p>Dziękujemy za skontaktowanie się z Zakup Mieszkanie. Otrzymaliśmy Twoją wiadomość i wkrótce się z Tobą skontaktujemy.</p>
      <br />
      <p>Z poważaniem,</p>
      <p>Zespół Zakup Mieszkanie</p>
    `

    const userRes = await fetch(`https://api.resend.com/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Formularz kontaktowy Zakup Mieszkanie <formularz@sending.zakupmieszkanie.pl>',
        to: email,
        subject: `Dziękujemy za kontakt z Zakup Mieszkanie`,
        html: userConfirmationTemplate,
        text: htmlToString(userConfirmationTemplate),
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
      name,
      email,
      eventName: 'Lead',
      eventSource: 'website',
      contentName: 'Contact Form Submission',
      slug,
      event_id,
      event_time,
    }

    // Get analytics data to check for pixel IDs
    const { analytics } = await getPageAnalyticsData(slug || '')

    // Send Meta conversion event if Meta Pixel ID exists
    if (analytics.meta?.pixelId) {
      await fetch('/api/meta-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversionData),
      })
    }

    // Send TikTok conversion event if TikTok Pixel ID exists
    if (analytics.tiktok?.pixelId) {
      await fetch('/api/tiktok-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversionData, event: 'Contact' }),
      })
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
