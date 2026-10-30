import { useEffect, type RefObject } from 'react'

const REST = 'rotateX(1.2deg) rotateY(0deg)'

/**
 * Subtle desktop-only parallax tilt that makes the panel feel physical, not flat.
 * Skipped on touch screens and when the user prefers reduced motion.
 */
export function useTilt(ref: RefObject<HTMLElement | null>, strength = 3.2) {
  useEffect(() => {
    const card = ref.current
    if (!card) return
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reducedMotion) return

    const move = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      card.style.transform = `rotateX(${-y * strength}deg) rotateY(${x * strength}deg)`
    }
    const leave = () => { card.style.transform = REST }

    card.addEventListener('pointermove', move)
    card.addEventListener('pointerleave', leave)
    return () => {
      card.removeEventListener('pointermove', move)
      card.removeEventListener('pointerleave', leave)
    }
  }, [ref, strength])
}
