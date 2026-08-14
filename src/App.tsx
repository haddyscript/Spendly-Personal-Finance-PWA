import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Logo } from '@/components/layout/Logo'
import { Toaster } from '@/components/ui/Toaster'
import { PwaUpdatePrompt } from '@/components/pwa/PwaUpdatePrompt'
import { useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks/useTheme'
import { processDueRecurring } from '@/services/recurringService'

const HomePage = lazy(() => import('@/pages/HomePage'))
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'))
const BudgetsPage = lazy(() => import('@/pages/BudgetsPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const GoalsPage = lazy(() => import('@/pages/GoalsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'))
const RecurringPage = lazy(() => import('@/pages/RecurringPage'))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background">
      <Logo size="lg" />
      <p className="text-sm text-muted-foreground">Loading Spendly…</p>
    </div>
  )
}

export default function App() {
  const { settings, isLoading } = useSettings()
  useTheme()

  useEffect(() => {
    processDueRecurring()
  }, [])

  if (isLoading || !settings) {
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster />
      <PwaUpdatePrompt />
    </Suspense>
  )
}
