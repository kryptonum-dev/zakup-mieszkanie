/**
 * Generates a unique event ID using UUID v4 and timestamp
 * @param timestamp - Optional timestamp to use for the event
 * @returns An object containing the event ID (UUID) and timestamp
 */
export function generateEventIdentifiers(timestamp?: number) {
  const eventTimestamp = timestamp || Math.floor(Date.now() / 1000)
  const eventId = crypto.randomUUID()

  return {
    event_id: eventId,
    event_time: eventTimestamp,
  }
}
