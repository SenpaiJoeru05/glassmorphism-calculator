import { formatEntry } from '../lib/format.ts'
import './Display.css'

interface DisplayProps {
  expression: string
  current: string
}

export function Display({ expression, current }: DisplayProps) {
  const shown = formatEntry(current)
  return (
    <div className="display" aria-live="polite">
      <div className="display-label">Calculator / Standard</div>
      <div className="expression">{expression}</div>
      <output className={`result${shown.length > 12 ? ' result--small' : ''}`}>{shown}</output>
    </div>
  )
}
