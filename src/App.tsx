import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Logo } from '@/components/layout/Logo'
import { Toaster } from '@/components/ui/Toaster'
import { PwaUpdatePrompt } from '@/components/pwa/PwaUpdatePrompt'
import { useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks/useTheme'
import { processDueRecurring } from '@/services/recurringService'

const pageImports = {
  home: () => import('@/pages/HomePage'),
  transactions: () => import('@/pages/TransactionsPage'),
  budgets: () => import('@/pages/BudgetsPage'),
  analytics: () => import('@/pages/AnalyticsPage'),
  goals: () => import('@/pages/GoalsPage'),
  settings: () => import('@/pages/SettingsPage'),
  categories: () => import('@/pages/CategoriesPage'),
  recurring: () => import('@/pages/RecurringPage'),
}

const HomePage = lazy(pageImports.home)
const TransactionsPage = lazy(pageImports.transactions)
const BudgetsPage = lazy(pageImports.budgets)
const AnalyticsPage = lazy(pageImports.analytics)
const GoalsPage = lazy(pageImports.goals)
const SettingsPage = lazy(pageImports.settings)
const CategoriesPage = lazy(pageImports.categories)
const RecurringPage = lazy(pageImports.recurring)
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))

// Prefetch every tab's chunk once the app is idle so switching bottom-nav tabs
// never re-triggers a Suspense fallback — tab switches should feel instant, like
// screens already loaded in memory, not pages being fetched.
function usePrefetchPages() {
  useEffect(() => {
    const prefetch = () => Object.values(pageImports).forEach((load) => load())
    const idle = 'requestIdleCallback' in window ? window.requestIdleCallback : (cb: () => void) => setTimeout(cb, 1)
    const handle = idle(prefetch)
    return () => {
      if ('cancelIdleCallback' in window && typeof handle === 'number') window.cancelIdleCallback(handle)
    }
  }, [])
}

const SPLASH_MIN_DURATION_MS = 10_000

// Keeps the launch splash on screen for a minimum duration, independent of how fast
// settings actually load, so the entrance animation has room to play out on cold start.
function useMinSplashDuration() {
  const [elapsed, setElapsed] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setElapsed(true), SPLASH_MIN_DURATION_MS)
    return () => clearTimeout(timer)
  }, [])
  return elapsed
}

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background">
      <Logo size="lg" className="animate-logo-launch" />
      <p className="animate-splash-text text-sm text-muted-foreground">Loading Spendly…</p>
    </div>
  )
}

export default function App() {
  const { settings, isLoading } = useSettings()
  const splashMinElapsed = useMinSplashDuration()
  useTheme()
  usePrefetchPages()

  useEffect(() => {
    processDueRecurring()
  }, [])

  if (isLoading || !settings || !splashMinElapsed) {
    return <Splash />
  }

  if (!settings.hasOnboarded) {
    return (
      <Suspense fallback={<Splash />}>
        <OnboardingPage />
        <Toaster />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<Splash />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/categories" element={<CategoriesPage />} />
          <Route path="settings/recurring" element={<RecurringPage />} />
        </Route>
        <Route path="welcome" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
      <PwaUpdatePrompt />
    </Suspense>
  )
}
