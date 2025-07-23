export type Props = {
  name: string
  phone: string
  legal: boolean
  landingPageName: string
}

export async function sendContactEmail({ name, phone, legal, landingPageName }: Props): Promise<{ success: boolean }> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, legal, landingPageName }),
  })
  return await response.json()
}
