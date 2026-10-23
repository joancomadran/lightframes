/**
 * A random v4 UUID. crypto.randomUUID only exists in secure contexts (HTTPS,
 * localhost) and from Safari 15.4, so opening the editor over the local
 * network or on an older iPad falls back to getRandomValues, which works everywhere.
 */
export function uid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  // Version 4, RFC 4122 variant.
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
