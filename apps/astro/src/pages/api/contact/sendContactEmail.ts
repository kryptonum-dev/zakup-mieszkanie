export type Props = {
  name: string
  email: string
  phone: string
  message?: string
  legal: boolean
  landingPageName: string
}

export async function sendContactEmail({ name, email, phone, message, legal, landingPageName }: Props): Promise<{ success: boolean }> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, message, legal, landingPageName }),
  })
  return await response.json()
}
