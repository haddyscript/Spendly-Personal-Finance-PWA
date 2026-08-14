import { useEffect } from 'react'
import { useSettings } from '@/hooks/useSettings'

function applyTheme(theme: 'system' | 'light' | 'dark') {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', isDark)
}

export function useTheme() {
  const { settings } = useSettings()
  const theme = settings?.theme ?? 'system'

  useEffect(() => {
    applyTheme(theme)

    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => applyTheme('system')
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [theme])

  return theme
}
