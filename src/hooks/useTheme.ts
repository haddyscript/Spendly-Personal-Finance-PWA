import { useEffect } from 'react'
import { useSettings } from '@/hooks/useSettings'

const THEME_STORAGE_KEY = 'spendly-theme'

function applyTheme(theme: 'system' | 'light' | 'dark') {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', isDark)

  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', isDark ? '#09090b' : '#fafafb')

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // localStorage unavailable (e.g. private browsing) — safe to ignore, only used to avoid a flash on next load
  }
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
