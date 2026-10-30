import { useEffect, type Dispatch } from 'react'
import type { CalculatorAction } from '../lib/calculator.ts'

const KEY_ACTIONS: Record<string, CalculatorAction> = {
  '.': { type: 'decimal' },
  ',': { type: 'decimal' },
  '+': { type: 'operator', operator: '+' },
  '-': { type: 'operator', operator: '−' },
  '*': { type: 'operator', operator: '×' },
  'x': { type: 'operator', operator: '×' },
  '/': { type: 'operator', operator: '÷' },
  '=': { type: 'equals' },
  'Enter': { type: 'equals' },
  'Backspace': { type: 'backspace' },
  'Delete': { type: 'clear' },
  'Escape': { type: 'clear' },
  '%': { type: 'percent' },
}

export function keyToAction(key: string): CalculatorAction | undefined {
  if (/^\d$/.test(key)) return { type: 'digit', digit: key }
  return KEY_ACTIONS[key]
}

/** Maps physical keys to calculator actions, leaving browser shortcuts alone. */
export function useKeyboard(dispatch: Dispatch<CalculatorAction>, onKey?: (key: string) => void) {
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const action = keyToAction(event.key)
      if (!action) return
      // Stop "/" opening quick-find and Enter re-clicking a focused button.
      event.preventDefault()
      dispatch(action)
      onKey?.(event.key)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [dispatch, onKey])
}
