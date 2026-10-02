import { useEffect, useState } from 'react'

/** The mockup switches from one column to list + detail at 820px. */
export const WIDE_BREAKPOINT = 820

export function useIsWide(breakpoint = WIDE_BREAKPOINT): boolean {
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= breakpoint,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`)
    const update = () => setWide(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [breakpoint])

  return wide
}
