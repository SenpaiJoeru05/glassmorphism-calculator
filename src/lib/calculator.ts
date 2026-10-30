import { ERROR, formatNumber, tidy } from './format.ts'

export type Operator = '+' | '−' | '×' | '÷'

export interface HistoryEntry {
  expression: string
  result: number
}

export interface Notice {
  id: number
  message: string
}

export interface CalculatorState {
  /** The number on the main display, exactly as typed (no grouping). */
  current: string
  /** Left-hand operand waiting for the operator to be applied. */
  stored: number | null
  operator: Operator | null
  /** An operator was just chosen; the next digit starts a new number. */
  waiting: boolean
  /** "=" was just pressed; the next digit starts a fresh calculation. */
  justCalculated: boolean
  expression: string
  history: HistoryEntry[]
  notice: Notice | null
}

export type CalculatorAction =
  | { type: 'digit'; digit: string }
  | { type: 'decimal' }
  | { type: 'operator'; operator: Operator }
  | { type: 'equals' }
  | { type: 'clear' }
  | { type: 'backspace' }
  | { type: 'percent' }
  | { type: 'recall'; value: number }
  | { type: 'clearHistory' }

export const MAX_DIGITS = 14
export const HISTORY_LIMIT = 8
const DIVIDE_BY_ZERO = 'Cannot divide by zero'

export const initialState = (history: HistoryEntry[] = []): CalculatorState => ({
  current: '0',
  stored: null,
  operator: null,
  waiting: false,
  justCalculated: false,
  expression: '',
  history,
  notice: null,
})

function compute(a: number, b: number, operator: Operator): number {
  switch (operator) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b === 0 ? NaN : a / b
  }
}

const startsFresh = (state: CalculatorState) =>
  state.current === ERROR || state.waiting || state.justCalculated || /e/i.test(state.current)

const digitCount = (entry: string) => entry.replace(/\D/g, '').length

const notify = (state: CalculatorState, message: string): Notice => ({
  id: (state.notice?.id ?? 0) + 1,
  message,
})

const divideByZero = (state: CalculatorState, expression: string): CalculatorState => ({
  ...state,
  current: ERROR,
  stored: null,
  operator: null,
  waiting: false,
  justCalculated: true,
  expression,
  notice: notify(state, DIVIDE_BY_ZERO),
})

export function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'digit': {
      if (startsFresh(state)) {
        return { ...state, current: action.digit, waiting: false, justCalculated: false }
      }
      if (digitCount(state.current) >= MAX_DIGITS) return state
      return { ...state, current: state.current === '0' ? action.digit : state.current + action.digit }
    }

    case 'decimal': {
      if (startsFresh(state)) {
        return { ...state, current: '0.', waiting: false, justCalculated: false }
      }
      if (state.current.includes('.')) return state
      return { ...state, current: `${state.current}.` }
    }

    case 'operator': {
      if (state.current === ERROR) return state
      let stored = Number(state.current)
      let current = state.current
      if (state.operator && state.stored !== null) {
        if (state.waiting) {
          // Pressing another operator straight away only swaps the operator.
          stored = state.stored
        } else {
          const outcome = compute(state.stored, stored, state.operator)
          if (!Number.isFinite(outcome)) return divideByZero(state, DIVIDE_BY_ZERO)
          stored = tidy(outcome)
          current = String(stored)
        }
      }
      return {
        ...state,
        current,
        stored,
        operator: action.operator,
        expression: `${formatNumber(stored)} ${action.operator}`,
        waiting: true,
        justCalculated: false,
      }
    }

    case 'equals': {
      const { stored, operator } = state
      if (operator === null || stored === null || state.waiting || state.current === ERROR) return state
      const operand = Number(state.current)
      const expression = `${formatNumber(stored)} ${operator} ${formatNumber(operand)} =`
      const outcome = compute(stored, operand, operator)
      if (!Number.isFinite(outcome)) return divideByZero(state, expression)
      const result = tidy(outcome)
      return {
        ...state,
        current: String(result),
        stored: null,
        operator: null,
        waiting: false,
        justCalculated: true,
        expression,
        history: [{ expression, result }, ...state.history].slice(0, HISTORY_LIMIT),
      }
    }

    case 'clear':
      // Keep the last notice so notice ids keep counting up across clears.
      return { ...initialState(state.history), notice: state.notice }

    case 'backspace': {
      if (startsFresh(state)) return { ...state, current: '0', justCalculated: false }
      const next = state.current.slice(0, -1)
      return { ...state, current: next === '' || next === '-' ? '0' : next }
    }

    case 'percent': {
      if (state.current === ERROR) return state
      return { ...state, current: String(tidy(Number(state.current) / 100)), waiting: false, justCalculated: false }
    }

    case 'recall':
      return { ...state, current: String(action.value), waiting: false, justCalculated: true }

    case 'clearHistory':
      return { ...state, history: [] }
  }
}
