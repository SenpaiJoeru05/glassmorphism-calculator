import { useRef, type Dispatch } from 'react'
import type { CalculatorAction, CalculatorState } from '../lib/calculator.ts'
import { useTilt } from '../hooks/useTilt.ts'
import { Display } from './Display.tsx'
import { Keypad } from './Keypad.tsx'
import './Calculator.css'

interface CalculatorProps {
  state: CalculatorState
  dispatch: Dispatch<CalculatorAction>
  pressed: string | null
}

export function Calculator({ state, dispatch, pressed }: CalculatorProps) {
  const card = useRef<HTMLElement>(null)
  useTilt(card)

  return (
    <section ref={card} className="calculator" aria-label="Calculator">
      <Display expression={state.expression} current={state.current} />
      <Keypad
        dispatch={dispatch}
        activeOperator={state.waiting ? state.operator : null}
        pressed={pressed}
      />
    </section>
  )
}
