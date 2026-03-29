import { useState, useEffect } from 'react'

export function useCountUp(target: number, duration = 800, enabled = true): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!enabled || target === 0) {
      setValue(target)
      return
    }

    setValue(0)
    const start = performance.now()

    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [target, enabled])

  return value
}
