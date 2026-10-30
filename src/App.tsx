import { useCallback, useEffect, useReducer, useState } from 'react'
import { calculatorReducer, initialState } from './lib/calculator.ts'
import { loadHistory, saveHistory } from './lib/storage.ts'
import { keyToAction, useKeyboard } from './hooks/useKeyboard.ts'
import { Topbar } from './components/Topbar.tsx'
import { Calculator } from './components/Calculator.tsx'
import { HistoryPanel } from './components/HistoryPanel.tsx'
import { Toast } from './components/Toast.tsx'
import { labelFor } from './components/keys.ts'

const PRESS_FLASH_MS = 140

export default function App() {
  const [state, dispatch] = useReducer(calculatorReducer, undefined, () => initialState(loadHistory()))
  const [historyOpen, setHistoryOpen] = useState(false)
  const [pressed, setPressed] = useState<string | null>(null)

  useEffect(() => saveHistory(state.history), [state.history])

  // Flash the on-screen key that matches a physical key press.
  const flashKey = useCallback((key: string) => {
    const action = keyToAction(key)
    setPressed(action ? labelFor(action) : null)
  }, [])
  useEffect(() => {
    if (pressed === null) return
    const timer = setTimeout(() => setPressed(null), PRESS_FLASH_MS)
    return () => clearTimeout(timer)
  }, [pressed])

  useKeyboard(dispatch, flashKey)

  return (
    <main className="app">
      <Topbar />
      <Calculator state={state} dispatch={dispatch} pressed={pressed} />
      <footer className="bottom">
        <span className="keyboard-hint"><kbd>0–9</kbd> <kbd>Enter</kbd> <kbd>⌫</kbd></span>
        <button
          type="button"
          className="text-button"
          aria-expanded={historyOpen}
          aria-controls="history"
          onClick={() => setHistoryOpen(open => !open)}
        >
          ◷ &nbsp; History{state.history.length > 0 && ` (${state.history.length})`}
        </button>
      </footer>
      {historyOpen && (
        <HistoryPanel
          id="history"
          history={state.history}
          onRecall={value => dispatch({ type: 'recall', value })}
          onClear={() => dispatch({ type: 'clearHistory' })}
        />
      )}
      <p className="credit">
        Built by{' '}
        <a href="https://github.com/SenpaiJoeru05" target="_blank" rel="noreferrer">Joel Rayton</a>
      </p>
      <Toast notice={state.notice} />
    </main>
  )
}
