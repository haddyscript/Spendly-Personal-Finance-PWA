import { useEffect, useRef, useState } from 'react'

const DEFAULT_DURATION_MS = 900

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Animates a number counting from its previously committed value up (or down) to `target`
 * whenever it changes, instead of jumping straight to it — starts from 0 on first mount. Used
 * for hero stat numbers like the Analytics "Total Spent" figure. Jumps straight to the target
 * with no animation when the user prefers reduced motion.
 */
export function useCountUp(target: number, durationMs = DEFAULT_DURATION_MS): number {
  const [value, setValue] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      fromRef.current = target
      return
    }

    const from = fromRef.current
    if (from === target) {
      setValue(target)
      return
    }

    let frame: number
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1)
      const eased = easeOutCubic(progress)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])

  return value
}
