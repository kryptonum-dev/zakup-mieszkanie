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

export const POST: APIRoute = async ({ request }) => {
  const { name, phone, legal } = (await request.json()) as Props;

  if (!REGEX.phone.test(phone) || !legal || !name) {
    return new Response(JSON.stringify({ message: 'Missing required fields', success: false }), { status: 400 });
  }

  const submissionDate = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
  const defaultStatus = 'Nowy';
  const newRow = [[submissionDate, name, `'${phone}`, defaultStatus]];

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
        range: `Sheet1!A:D`,
        valueInputOption: 'USER_ENTERED',
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
      const slackMessage = {
        text: `🧲 *Nowy lead!* \n\nImię: ${name}\nTelefon: ${phone}`,
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
      const htmlTemplate = `<p>Imię: <b>${name}</b></p><p>Numer telefonu: <b>${phone}</b></p>`;
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Formularz Zakup Mieszkanie <formularz@sending.zakupmieszkanie.pl>',
          to: 'kontakt@zakupmieszkanie.pl',
          subject: '⭐️ Nowy lead Zakup Mieszkanie',
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
    ]);

    return new Response(JSON.stringify({ message: 'Successfully processed lead', success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred while processing the lead', success: false }), { status: 500 });
  }
};
