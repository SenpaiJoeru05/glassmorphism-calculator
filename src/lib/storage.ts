import type { HistoryEntry } from './calculator.ts'

const KEY = 'glass-calculator:history'

const isEntry = (value: unknown): value is HistoryEntry =>
  typeof value === 'object' && value !== null &&
  typeof (value as HistoryEntry).expression === 'string' &&
  typeof (value as HistoryEntry).result === 'number'

// Storage can be missing or throw (private windows, blocked site data), so the
// calculator must still work when it does — it just forgets on reload.
export function loadHistory(): HistoryEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isEntry) : []
  } catch {
    return []
  }
}

export function saveHistory(history: HistoryEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(history))
  } catch {
    // Ignore — history simply won't persist.
  }
}
