import type { APIRoute } from 'astro'
import { REGEX } from '@global/constants'
import { htmlToString } from '@utils/html-to-string'
import type { Props } from './sendContactEmail'

const RESEND_API_KEY: string = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY

export const POST: APIRoute = async ({ request }) => {
  const { name, phone, legal } = (await request.json()) as Props

  if (!REGEX.phone.test(phone) || !legal || !name) {
    return new Response(
      JSON.stringify({
        message: 'Missing required fields',
        success: false,
      }), { status: 400 }
    )
  }

  const htmlTemplate = `
    <p>Imię: <b>${name}</b></p>
    <p>Numer telefonu: <b>${phone}</b></p>
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
        subject: '⭐️ Nowy kontakt z formularza kontaktowego',
        html: htmlTemplate,
        text: htmlToString(htmlTemplate),
      }),
    })

    if (res.status !== 200) {
      return new Response(
        JSON.stringify({
          message: 'Something went wrong',
          success: false,
        }), { status: 400 }
      )
    }

    return new Response(
      JSON.stringify({
        message: 'Successfully sent message',
        success: true,
      }), { status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'An error occurred while sending message',
        success: false,
      }), { status: 400 }
    )
  }
}
