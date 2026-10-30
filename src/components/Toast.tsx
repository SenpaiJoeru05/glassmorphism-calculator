import { useEffect, useState } from 'react'
import type { Notice } from '../lib/calculator.ts'
import './Toast.css'

const VISIBLE_MS = 1800

export function Toast({ notice }: { notice: Notice | null }) {
  const [hiddenId, setHiddenId] = useState<number | null>(null)

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setHiddenId(notice.id), VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [notice])

  const visible = notice !== null && notice.id !== hiddenId
  return (
    <div className={`toast${visible ? ' toast--show' : ''}`} role="status">
      {notice?.message}
    </div>
  )
}
