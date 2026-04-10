/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currency: string): string {
  const localeMap: Record<string, string> = {
    ILS: 'he-IL',
    USD: 'en-US',
    EUR: 'de-DE',
  }
  const locale = localeMap[currency] ?? 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format a date relative to now (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date, locale: string = 'en'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const diffMs = date.getTime() - Date.now()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    if (Math.abs(diffHours) < 1) {
      const diffMinutes = Math.round(diffMs / (1000 * 60))
      return rtf.format(diffMinutes, 'minute')
    }
    return rtf.format(diffHours, 'hour')
  }
  return rtf.format(diffDays, 'day')
}

/**
 * Truncate text to maxLength with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + '\u2026'
}
