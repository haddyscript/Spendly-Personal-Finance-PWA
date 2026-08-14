import { useEffect, useState } from 'react'

export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const target = document.documentElement
    const observer = new MutationObserver(() => setIsDark(target.classList.contains('dark')))
    observer.observe(target, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}
