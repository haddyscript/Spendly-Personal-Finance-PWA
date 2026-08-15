import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, ShieldCheck, Sparkles, WifiOff } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSettings } from '@/hooks/useSettings'
import { useToast } from '@/hooks/useToast'
import { updateSettings } from '@/services/settingsService'
import { clearAllData } from '@/services/exportImportService'
import { seedDemoData } from '@/db/seed'
import { GLASS } from '@/lib/glass'

const FEATURES = [
  { icon: WifiOff, text: 'Works fully offline — your data never leaves this device' },
  { icon: BarChart3, text: 'Budgets, goals, and spending analytics at a glance' },
  { icon: ShieldCheck, text: 'No accounts, no tracking, no ads' },
]

export default function OnboardingPage() {
  const { settings } = useSettings()
  const { success } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<'empty' | 'demo' | null>(null)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const isRevisit = settings?.hasOnboarded === true

  async function startFresh() {
    setLoading('demo')
    try {
      await seedDemoData()
      await updateSettings({ hasOnboarded: true })
      navigate('/', { replace: true })
    } finally {
      setLoading(null)
    }
  }

  async function startEmpty() {
    setLoading('empty')
    try {
      await updateSettings({ hasOnboarded: true })
      navigate('/', { replace: true })
    } finally {
      setLoading(null)
    }
  }

  async function handleClearAndRestart() {
    setLoading('empty')
    try {
      await clearAllData()
      setConfirmClearOpen(false)
      success('All data cleared', 'Starting fresh with empty data.')
      navigate('/', { replace: true })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col justify-between bg-background px-6 pb-8 pt-14 safe-top safe-bottom">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-violet-500/20 blur-[90px]" />
        <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-orange-500/15 blur-[100px]" />
        <div className="absolute bottom-10 left-1/4 h-56 w-56 rounded-full bg-blue-500/10 blur-[90px]" />
      </div>
      {isRevisit && (
        <button
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="Back to Settings"
          className="absolute left-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary safe-top"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}

      <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight">Spendly</h1>
        <p className="mt-2 text-muted-foreground">Know where your money goes.</p>

        <div className="mt-10 flex w-full flex-col gap-4 text-left">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className={`${GLASS} flex items-center gap-3 rounded-2xl p-3.5`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm text-foreground">{text}</p>
            </div>
          ))}
        </div>

        {isRevisit && (
          <p className="mt-6 text-xs text-muted-foreground">
            You've already set up Spendly. Demo data adds sample transactions, budgets, and goals on top of what
            you already have. Empty data clears everything and starts fresh — that can't be undone unless you have
            an exported backup.
          </p>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
        <Button size="lg" onClick={startFresh} disabled={loading !== null}>
          <Sparkles className="h-4 w-4" />
          {loading === 'demo' ? 'Setting up…' : 'Explore with demo data'}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => (isRevisit ? setConfirmClearOpen(true) : startEmpty())}
          disabled={loading !== null}
        >
          {loading === 'empty' ? 'Setting up…' : isRevisit ? 'Clear data & start empty' : 'Start with empty data'}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        title="Delete all Spendly data?"
        description="This clears every transaction, budget, and goal on this device and starts empty. This cannot be undone unless you have an exported backup."
        confirmLabel="Delete Everything"
        destructive
        onConfirm={handleClearAndRestart}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  )
}
