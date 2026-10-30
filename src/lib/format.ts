export const ERROR = 'Error'

/** Rounds away binary float noise, e.g. 0.1 + 0.2 → 0.3. */
export const tidy = (value: number) => Number(value.toPrecision(12))

/** Formats a finished number for the expression line and history. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return ERROR
  const magnitude = Math.abs(value)
  if (magnitude >= 1e12 || (magnitude > 0 && magnitude < 1e-7)) {
    return value.toExponential(6).replace(/\.?0+e/, 'e')
  }
  return tidy(value).toLocaleString('en-US', { maximumFractionDigits: 10 })
}

/**
 * Groups the integer part of a number still being typed ("1234.50" → "1,234.50")
 * without touching what the user has entered after the decimal point.
 */
export function formatEntry(entry: string): string {
  if (entry === ERROR || /e/i.test(entry)) return entry
  const [whole, fraction] = entry.split('.')
  const sign = whole.startsWith('-') ? '-' : ''
  const grouped = whole.slice(sign.length).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return sign + grouped + (fraction !== undefined ? `.${fraction}` : '')
}
