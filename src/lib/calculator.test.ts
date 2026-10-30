import { describe, expect, it } from 'vitest'
import {
  HISTORY_LIMIT,
  MAX_DIGITS,
  calculatorReducer,
  initialState,
  type CalculatorAction,
  type CalculatorState,
  type Operator,
} from './calculator.ts'
import { ERROR } from './format.ts'

/** Feeds a string of keys through the reducer: digits, ".", operators, "=", "%", "<" (backspace), "C". */
function press(keys: string, state: CalculatorState = initialState()): CalculatorState {
  return [...keys].reduce((next, key) => calculatorReducer(next, toAction(key)), state)
}

function toAction(key: string): CalculatorAction {
  if (/\d/.test(key)) return { type: 'digit', digit: key }
  if ('+−×÷'.includes(key)) return { type: 'operator', operator: key as Operator }
  switch (key) {
    case '.': return { type: 'decimal' }
    case '=': return { type: 'equals' }
    case '%': return { type: 'percent' }
    case '<': return { type: 'backspace' }
    case 'C': return { type: 'clear' }
    default: throw new Error(`Unknown key ${key}`)
  }
}

describe('number entry', () => {
  it('replaces the leading zero', () => {
    expect(press('7').current).toBe('7')
    expect(press('007').current).toBe('7')
  })

  it('allows a single decimal point', () => {
    expect(press('1.2.3').current).toBe('1.23')
    expect(press('.5').current).toBe('0.5')
  })

  it(`stops at ${MAX_DIGITS} digits`, () => {
    expect(press('9'.repeat(MAX_DIGITS + 3)).current).toBe('9'.repeat(MAX_DIGITS))
  })

  it('starts a new number after an operator', () => {
    const state = press('12+3')
    expect(state.current).toBe('3')
    expect(state.stored).toBe(12)
  })
})

describe('operations', () => {
  it.each([
    ['2+3=', '5'],
    ['9−12=', '-3'],
    ['6×7=', '42'],
    ['1÷4=', '0.25'],
    ['.1+.2=', '0.3'],
  ])('%s gives %s', (keys, expected) => {
    expect(press(keys).current).toBe(expected)
  })

  it('chains operators left to right', () => {
    const state = press('2+3×4')
    expect(state.current).toBe('4')
    expect(state.stored).toBe(5)
    expect(press('=', state).current).toBe('20')
  })

  it('swaps the operator when two are pressed in a row', () => {
    const state = press('8+−')
    expect(state.operator).toBe('−')
    expect(state.expression).toBe('8 −')
    expect(press('3=', state).current).toBe('5')
  })

  it('ignores equals without a pending operation', () => {
    expect(press('5=')).toEqual(press('5'))
    expect(press('5+=').current).toBe('5')
  })

  it('starts fresh when typing after a result', () => {
    expect(press('2+2=7').current).toBe('7')
    expect(press('2+2=.').current).toBe('0.')
  })

  it('continues from a result when an operator follows it', () => {
    expect(press('2+2=×3=').current).toBe('12')
  })

  it('shows the full expression after equals', () => {
    expect(press('1200+34=').expression).toBe('1,200 + 34 =')
  })
})

describe('divide by zero', () => {
  it('shows an error and a notice on equals', () => {
    const state = press('5÷0=')
    expect(state.current).toBe(ERROR)
    expect(state.notice?.message).toBe('Cannot divide by zero')
  })

  it('shows an error when chaining through a zero division', () => {
    expect(press('5÷0+').current).toBe(ERROR)
  })

  it('ignores operators while in error and recovers on the next digit', () => {
    const errored = press('5÷0=')
    expect(press('+', errored)).toBe(errored)
    expect(press('4', errored).current).toBe('4')
  })

  it('gives each notice a new id so a repeat error still shows', () => {
    const first = press('5÷0=')
    const second = press('C5÷0=', first)
    expect(second.notice?.id).toBe((first.notice?.id ?? 0) + 1)
  })
})

describe('editing', () => {
  it('backspace removes the last character', () => {
    expect(press('123<').current).toBe('12')
    expect(press('1<').current).toBe('0')
    expect(press('1.<').current).toBe('1')
  })

  it('backspace clears a result instead of editing it', () => {
    expect(press('2+2=<').current).toBe('0')
  })

  it('backspace never leaves a lone minus sign', () => {
    expect(press('1−5=<').current).toBe('0')
    expect(press('<', { ...initialState(), current: '-4' }).current).toBe('0')
  })

  it('percent divides by one hundred', () => {
    expect(press('50%').current).toBe('0.5')
    expect(press('200+10%=').current).toBe('200.1')
  })

  it('clear resets everything but keeps history', () => {
    const state = press('2+2=3+C')
    expect(state).toEqual({ ...initialState(state.history), notice: state.notice })
    expect(state.history).toHaveLength(1)
  })
})

describe('history', () => {
  it('records each result, newest first', () => {
    const state = press('1+1=2×3=')
    expect(state.history).toEqual([
      { expression: '2 × 3 =', result: 6 },
      { expression: '1 + 1 =', result: 2 },
    ])
  })

  it(`keeps only the last ${HISTORY_LIMIT} results`, () => {
    const state = press('1+1='.repeat(HISTORY_LIMIT + 2))
    expect(state.history).toHaveLength(HISTORY_LIMIT)
  })

  it('does not record failed calculations', () => {
    expect(press('5÷0=').history).toEqual([])
  })

  it('recalls a past result onto the display', () => {
    const state = calculatorReducer(press('9'), { type: 'recall', value: 42 })
    expect(state.current).toBe('42')
    expect(press('+1=', state).current).toBe('43')
  })

  it('clears history on request', () => {
    const state = calculatorReducer(press('1+1='), { type: 'clearHistory' })
    expect(state.history).toEqual([])
  })
})
