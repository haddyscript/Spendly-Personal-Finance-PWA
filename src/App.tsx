import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Logo } from '@/components/layout/Logo'
import { Toaster } from '@/components/ui/Toaster'
import { PwaUpdatePrompt } from '@/components/pwa/PwaUpdatePrompt'
import { useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks/useTheme'
import { processDueRecurring } from '@/services/recurringService'
import { isNotificationSupported, notify, requestNotificationPermission } from '@/services/notificationService'
import { checkLogReminder } from '@/services/reminderService'
import { checkNoSpendMilestone } from '@/services/noSpendService'
import { cn } from '@/lib/cn'

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
const SPLASH_EXIT_DURATION_MS = 380

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

const SPARKLES = [
  { top: '18%', left: '20%', size: 6, color: 'bg-violet-300', delay: '0s' },
  { top: '24%', left: '78%', size: 4, color: 'bg-amber-300', delay: '0.4s' },
  { top: '62%', left: '14%', size: 5, color: 'bg-amber-300', delay: '0.9s' },
  { top: '68%', left: '80%', size: 6, color: 'bg-violet-300', delay: '1.3s' },
  { top: '40%', left: '8%', size: 3, color: 'bg-violet-300', delay: '1.7s' },
  { top: '46%', left: '92%', size: 4, color: 'bg-amber-300', delay: '0.65s' },
  { top: '80%', left: '46%', size: 3, color: 'bg-violet-300', delay: '2.1s' },
]

function Splash({ exiting = false }: { exiting?: boolean }) {
  return (
    <div
      className={cn(
        'relative flex min-h-dvh flex-col items-center justify-center gap-5 overflow-hidden bg-background',
        exiting && 'animate-splash-exit',
      )}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-glow-pulse absolute -top-16 -left-16 h-64 w-64 rounded-full bg-violet-500/20 blur-[90px]" />
        <div className="animate-glow-pulse absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-orange-500/15 blur-[100px] [animation-delay:0.7s]" />
        <div className="animate-glow-pulse absolute bottom-10 left-1/4 h-56 w-56 rounded-full bg-blue-500/10 blur-[90px] [animation-delay:1.4s]" />

        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className={cn('animate-sparkle absolute rounded-full', s.color)}
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-center">
        <span className="animate-logo-ring absolute h-14 w-14 rounded-2xl border-2 border-violet-500/50" aria-hidden="true" />
        <span
          className="animate-logo-ring absolute h-14 w-14 rounded-2xl border-2 border-amber-400/40 [animation-delay:0.9s]"
          aria-hidden="true"
        />
        <Logo size="lg" className="animate-logo-launch relative" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <h1 className="animate-title-reveal bg-gradient-to-r from-foreground via-violet-400 to-foreground bg-clip-text text-2xl font-bold tracking-tight text-transparent [background-size:200%_auto]">
          Spendly
        </h1>
        <p className="animate-splash-text text-sm text-muted-foreground [animation-delay:0.4s]">
          Know where your money goes.
        </p>
      </div>

      <div className="animate-splash-text h-1 w-32 overflow-hidden rounded-full bg-secondary [animation-delay:0.55s]">
        <div className="animate-progress-indeterminate h-full w-1/3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500" />
      </div>
    </div>
  )
}

export default function App() {
  const { settings, isLoading } = useSettings()
  const splashMinElapsed = useMinSplashDuration()
  useTheme()
  usePrefetchPages()

  // Drives a brief fade-and-scale exit instead of an abrupt cut from splash to app content.
  // hasStartedExit (a ref, not state) keeps this effect's dependency array down to just
  // `dataReady` — including splashPhase itself here would make React re-run the effect (and
  // therefore clear the timer via cleanup) the instant setSplashPhase('exiting') fires below,
  // cancelling the timeout before it ever reaches 'done' and leaving the app stuck showing a
  // fully faded-out (invisible) splash forever.
  const dataReady = !isLoading && !!settings && splashMinElapsed
  const [splashPhase, setSplashPhase] = useState<'visible' | 'exiting' | 'done'>('visible')
  const hasStartedExit = useRef(false)
  useEffect(() => {
    if (!dataReady || hasStartedExit.current) return
    hasStartedExit.current = true
    setSplashPhase('exiting')
    const timer = setTimeout(() => setSplashPhase('done'), SPLASH_EXIT_DURATION_MS)
    return () => clearTimeout(timer)
  }, [dataReady])

  useEffect(() => {
    processDueRecurring().then((count) => {
      if (count === 0) return
      notify('Recurring transactions added', {
        body: `${count} recurring transaction${count > 1 ? 's were' : ' was'} added to your history today.`,
        tag: 'recurring-due',
      })
    })
  }, [])

  // Fires on every app open, unlike the other notifications below which are conditional.
  useEffect(() => {
    notify('Welcome back to Spendly', {
      body: "Don't forget to log today's transactions.",
      tag: 'app-open',
    })
  }, [])

  useEffect(() => {
    checkLogReminder()
    // Re-checks periodically in case the PWA is left open in a background tab for hours,
    // since there's no reliable way to wake it up once the app is fully closed.
    const interval = setInterval(checkLogReminder, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // No-spend streak only changes at a day boundary or when an expense breaks it — mid-session
  // polling isn't needed, just a fresh check whenever the app is opened.
  useEffect(() => {
    checkNoSpendMilestone()
  }, [])

  // Notifications are on by default, so prompt for OS permission once onboarding is done
  // rather than leaving the Settings toggle silently inert until someone finds and taps it.
  useEffect(() => {
    if (!settings?.hasOnboarded || !settings.notificationsEnabled) return
    if (isNotificationSupported() && Notification.permission === 'default') {
      requestNotificationPermission()
    }
  }, [settings?.hasOnboarded, settings?.notificationsEnabled])

  if (splashPhase !== 'done' || !settings) {
    return <Splash exiting={splashPhase === 'exiting'} />
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
