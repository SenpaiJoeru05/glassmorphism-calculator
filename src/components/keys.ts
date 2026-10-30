import type { CalculatorAction, Operator } from '../lib/calculator.ts'

export interface KeySpec {
  label: string
  action: CalculatorAction
  variant?: 'utility' | 'operator' | 'equals'
  ariaLabel?: string
  wide?: boolean
}

const digit = (d: string): KeySpec => ({ label: d, action: { type: 'digit', digit: d } })
const operator = (op: Operator, ariaLabel: string): KeySpec => ({
  label: op,
  action: { type: 'operator', operator: op },
  variant: 'operator',
  ariaLabel,
})

/** The keypad, in reading order. */
export const KEYS: KeySpec[] = [
  { label: 'AC', action: { type: 'clear' }, variant: 'utility', ariaLabel: 'Clear all' },
  { label: '⌫', action: { type: 'backspace' }, variant: 'utility', ariaLabel: 'Backspace' },
  { label: '%', action: { type: 'percent' }, variant: 'utility', ariaLabel: 'Percent' },
  operator('÷', 'Divide'),
  digit('7'), digit('8'), digit('9'), operator('×', 'Multiply'),
  digit('4'), digit('5'), digit('6'), operator('−', 'Subtract'),
  digit('1'), digit('2'), digit('3'), operator('+', 'Add'),
  { ...digit('0'), wide: true },
  { label: '.', action: { type: 'decimal' }, ariaLabel: 'Decimal point' },
  { label: '=', action: { type: 'equals' }, variant: 'equals', ariaLabel: 'Equals' },
]

/** The label of the on-screen key that performs an action, if there is one. */
export function labelFor(action: CalculatorAction): string | null {
  const wanted = JSON.stringify(action)
  return KEYS.find(key => JSON.stringify(key.action) === wanted)?.label ?? null
}
