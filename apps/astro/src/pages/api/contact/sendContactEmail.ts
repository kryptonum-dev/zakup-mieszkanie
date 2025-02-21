export type Props = {
  name: string
  email: string
  message: string
  legal: boolean
  slug?: string
}

export async function sendContactEmail({ name, email, message, legal, slug }: Props): Promise<{ success: boolean }> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message, legal, slug }),
  })

  return await response.json()
}
