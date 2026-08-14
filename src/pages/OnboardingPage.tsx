import { useState } from 'react'
import { BarChart3, ShieldCheck, Sparkles, WifiOff } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { updateSettings } from '@/services/settingsService'
import { seedDemoData } from '@/db/seed'

const FEATURES = [
  { icon: WifiOff, text: 'Works fully offline — your data never leaves this device' },
  { icon: BarChart3, text: 'Budgets, goals, and spending analytics at a glance' },
  { icon: ShieldCheck, text: 'No accounts, no tracking, no ads' },
]

export default function OnboardingPage() {
  const [loading, setLoading] = useState<'empty' | 'demo' | null>(null)

  async function start(withDemoData: boolean) {
    setLoading(withDemoData ? 'demo' : 'empty')
    try {
      if (withDemoData) {
        await seedDemoData()
      }
      await updateSettings({ hasOnboarded: true })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-background px-6 pb-8 pt-14 safe-top safe-bottom">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight">Spendly</h1>
        <p className="mt-2 text-muted-foreground">Know where your money goes.</p>

        <div className="mt-10 flex w-full flex-col gap-4 text-left">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm text-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
        <Button size="lg" onClick={() => start(true)} disabled={loading !== null}>
          <Sparkles className="h-4 w-4" />
          {loading === 'demo' ? 'Setting up…' : 'Explore with demo data'}
        </Button>
        <Button size="lg" variant="outline" onClick={() => start(false)} disabled={loading !== null}>
          {loading === 'empty' ? 'Setting up…' : 'Start with empty data'}
        </Button>
      </div>
    </div>
  )
}
