import type { HistoryEntry } from '../lib/calculator.ts'
import { formatNumber } from '../lib/format.ts'
import './HistoryPanel.css'

interface HistoryPanelProps {
  id: string
  history: HistoryEntry[]
  onRecall: (value: number) => void
  onClear: () => void
}

export function HistoryPanel({ id, history, onRecall, onClear }: HistoryPanelProps) {
  return (
    <section id={id} className="history" aria-label="Calculation history">
      <div className="history-head">
        <span>Recent calculations</span>
        {history.length > 0 && (
          <button type="button" className="text-button" onClick={onClear}>Clear history</button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="history-empty">Your calculations will appear here.</p>
      ) : (
        <ul className="history-list">
          {history.map((entry, index) => (
            <li key={`${index}-${entry.expression}`}>
              <button
                type="button"
                className="history-item"
                title="Use this result"
                onClick={() => onRecall(entry.result)}
              >
                <span>{entry.expression}</span>
                <strong>{formatNumber(entry.result)}</strong>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
