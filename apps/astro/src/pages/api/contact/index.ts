export const prerender = false

import { REGEX, RESEND_API_KEY } from '@/global/constants'
import { isPreviewDeployment } from '@/src/utils/is-preview-deployment'
import { generateEventIdentifiers } from '@/utils/event-identifiers'
import { htmlToString } from '@/utils/html-to-string'
import type { APIRoute } from 'astro'
import type { Props } from './sendContactEmail'

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
  const textTemplate = htmlToString(htmlTemplate)

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
        subject: `Wiadomość z formularza kontaktowego Zakup Mieszkanie`,
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
      <p>Dziękujemy za skontaktowanie się z Zakup Mieszkanie. Otrzymaliśmy Twoją wiadomość i wkrótce się z Tobą skontaktujemy.</p>
      <br />
      <p>Z poważaniem,</p>
      <p>Zespół Zakup Mieszkanie</p>
    `
    const userConfirmationText = htmlToString(userConfirmationTemplate)

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

    if (!isPreviewDeployment) {
      try {
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

        const response = await fetch('/api/meta-conversions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(conversionData),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message)
        }
      } catch (error) {
        throw new Error('Failed to send Meta conversion event')
      }
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
