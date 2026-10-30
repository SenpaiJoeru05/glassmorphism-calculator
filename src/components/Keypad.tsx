import type { Dispatch } from 'react'
import type { CalculatorAction, Operator } from '../lib/calculator.ts'
import { KEYS } from './keys.ts'
import './Keypad.css'

interface KeypadProps {
  dispatch: Dispatch<CalculatorAction>
  /** The operator waiting for its second operand, highlighted on the pad. */
  activeOperator: Operator | null
  /** Label of the key just pressed on the physical keyboard. */
  pressed: string | null
}

export function Keypad({ dispatch, activeOperator, pressed }: KeypadProps) {
  return (
    <div className="keypad">
      {KEYS.map(key => {
        const classes = [
          'key',
          key.variant,
          key.wide && 'key--wide',
          key.variant === 'operator' && key.label === activeOperator && 'active',
          pressed === key.label && 'pressed',
        ].filter(Boolean).join(' ')
        return (
          <button
            key={key.label}
            type="button"
            className={classes}
            aria-label={key.ariaLabel}
            onClick={() => dispatch(key.action)}
          >
            {key.label}
          </button>
        )
      })}
    </div>
  )
}
