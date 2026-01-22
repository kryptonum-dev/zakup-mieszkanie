import type { APIRoute } from 'astro';
import { google } from 'googleapis';
import { REGEX } from '@global/constants';
import { htmlToString } from '@utils/html-to-string';
import type { Props } from './sendContactEmail';

const RESEND_API_KEY = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || import.meta.env.SLACK_WEBHOOK_URL;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || import.meta.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || import.meta.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const SMS_API_TOKEN = process.env.SMS_API_TOKEN || import.meta.env.SMS_API_TOKEN;

const normalizePhoneForSmsApi = (phone: string) => phone.replace(/\D/g, '');

const sendClientSms = async ({ phone }: { phone: string }) => {
  if (!SMS_API_TOKEN) return;

  // SMS content must be short & consistent (user requested exact copy)
  const message =
    'Czesc! Tu Krzysztof Iwan (Zakup Mieszkanie). Dostalem Twoje zgloszenie. Zadzwonie niebawem z numeru 791 763 339, aby porozmawiac o konkretach. Do uslyszenia!';

  try {
    const to = normalizePhoneForSmsApi(phone);
    const body = new URLSearchParams({
      to,
      message,
      // no `from` => SMSAPI uses the account's default sender field (configured in dashboard)
      format: 'json',
    });

    const response = await fetch('https://api.smsapi.pl/sms.do', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMS_API_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const text = await response.text();
    if (!response.ok) {
      console.error('SMSAPI error response:', { status: response.status, text });
      return;
    }

    // SMSAPI may respond with JSON when format=json, but keep it robust.
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      if (typeof json?.error === 'number' || typeof json?.error === 'string') {
        console.error('SMSAPI error response:', json);
        return;
      }
      console.log('SMSAPI success response:', json);
    } catch {
      console.log('SMSAPI response:', text);
    }
  } catch (error) {
    console.error('Error sending SMS via SMSAPI:', error);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const { name, email, phone, message, legal, landingPageName } = (await request.json()) as Props & { landingPageName: string; message?: string };

  if (!REGEX.phone.test(phone) || !REGEX.email.test(email) || !legal || !name) {
    return new Response(JSON.stringify({ message: 'Missing required fields', success: false }), { status: 400 });
  }

  const submissionDate = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
  const defaultStatus = 'Nowy';
  const sanitizedMessage = message?.trim() || '';
  // Columns: Landing Page | Data | Imię | Adres email | Numer Telefonu | Wiadomość | Status
  const newRow = [[landingPageName || 'Brak nazwy', submissionDate, name, email, `'${phone}`, sanitizedMessage, defaultStatus]];

  const appendToSheet = async () => {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: GOOGLE_PRIVATE_KEY,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });

      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `Sheet1!A1`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: newRow,
        },
      });
      console.log('Successfully appended to Google Sheet.');
    } catch (error) {
      console.error('Error appending to Google Sheet:', error);
    }
  };

  const sendSlackNotification = async () => {
    if (!SLACK_WEBHOOK_URL) return;
    try {
      const messageText = sanitizedMessage ? `\nWiadomość: ${sanitizedMessage}` : '';
      const slackMessage = {
        text: `🧲 *Nowy lead!* \n\nLanding Page: ${landingPageName || 'Brak nazwy'}\nImię: ${name}\nEmail: ${email}\nTelefon: ${phone}${messageText}`,
      };
      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage),
      });
      console.log('Successfully sent Slack notification.');
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  };

  const sendContactEmail = async () => {
    try {
      const messageHtml = sanitizedMessage ? `<p>Wiadomość: <b>${sanitizedMessage}</b></p>` : '';
      const htmlTemplate = `<p><b>Landing Page:</b> ${landingPageName || 'Brak nazwy'}</p><p>Imię: <b>${name}</b></p><p>Email: <b>${email}</b></p><p>Numer telefonu: <b>${phone}</b></p>${messageHtml}`;
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Formularz Zakup Mieszkanie <formularz@sending.zakupmieszkanie.pl>',
          to: 'kontakt@zakupmieszkanie.pl',
          subject: `⭐️ Nowy lead z ${landingPageName || 'Zakup Mieszkanie'}`,
          html: htmlTemplate,
          text: htmlToString(htmlTemplate),
        }),
      });
      if (!response.ok) {
        throw new Error(`Resend API responded with status: ${response.status}`);
      }
      console.log('Successfully sent email via Resend.');
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      throw error;
    }
  };

  try {
    await Promise.allSettled([
      appendToSheet(),
      sendSlackNotification(),
      sendContactEmail(),
      sendClientSms({ phone }),
    ]);

    return new Response(JSON.stringify({ message: 'Successfully processed lead', success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred while processing the lead', success: false }), { status: 500 });
  }
};
