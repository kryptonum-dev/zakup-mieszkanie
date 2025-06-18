export type Props = {
  name: string
  phone: string
  legal: boolean
}

export async function sendContactEmail({ name, phone, legal }: Props): Promise<{ success: boolean }> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, legal }),
  })
  return await response.json()
}
