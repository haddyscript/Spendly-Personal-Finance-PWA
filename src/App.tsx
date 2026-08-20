import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Logo } from '@/components/layout/Logo'
import { Toaster } from '@/components/ui/Toaster'
import { PwaUpdatePrompt } from '@/components/pwa/PwaUpdatePrompt'
import { useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks/useTheme'
import { processDueRecurring } from '@/services/recurringService'
import { notify } from '@/services/notificationService'
import { checkLogReminder } from '@/services/reminderService'

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

const SPLASH_MIN_DURATION_MS = 3_000

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
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-5 overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-glow-pulse absolute -top-16 -left-16 h-64 w-64 rounded-full bg-violet-500/20 blur-[90px]" />
        <div className="animate-glow-pulse absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-orange-500/15 blur-[100px] [animation-delay:0.7s]" />
        <div className="animate-glow-pulse absolute bottom-10 left-1/4 h-56 w-56 rounded-full bg-blue-500/10 blur-[90px] [animation-delay:1.4s]" />
      </div>

      <div className="relative flex items-center justify-center">
        <span className="animate-logo-ring absolute h-14 w-14 rounded-2xl border-2 border-violet-500/50" aria-hidden="true" />
        <span
          className="animate-logo-ring absolute h-14 w-14 rounded-2xl border-2 border-violet-500/50 [animation-delay:0.9s]"
          aria-hidden="true"
        />
        <Logo size="lg" className="animate-logo-launch relative" />
      </div>

      <h1 className="animate-splash-text text-2xl font-bold tracking-tight">Spendly</h1>

      <div className="animate-splash-text flex items-center gap-1.5 [animation-delay:0.15s]">
        <span className="animate-splash-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        <span className="animate-splash-dot h-1.5 w-1.5 rounded-full bg-muted-foreground [animation-delay:0.15s]" />
        <span className="animate-splash-dot h-1.5 w-1.5 rounded-full bg-muted-foreground [animation-delay:0.3s]" />
      </div>
    </div>
  )
}

export default function App() {
  const { settings, isLoading } = useSettings()
  const splashMinElapsed = useMinSplashDuration()
  useTheme()
  usePrefetchPages()

  useEffect(() => {
    processDueRecurring().then((count) => {
      if (count === 0) return
      notify('Recurring transactions added', {
        body: `${count} recurring transaction${count > 1 ? 's were' : ' was'} added to your history today.`,
        tag: 'recurring-due',
      })
    })
  }, [])

  useEffect(() => {
    checkLogReminder()
    // Re-checks periodically in case the PWA is left open in a background tab for hours,
    // since there's no reliable way to wake it up once the app is fully closed.
    const interval = setInterval(checkLogReminder, 30 * 60 * 1000)
    return () => clearInterval(interval)
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
