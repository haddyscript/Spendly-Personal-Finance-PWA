import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Download,
  Fingerprint,
  Moon,
  Repeat,
  Shapes,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Logo } from '@/components/layout/Logo'
import { DataOverviewCard } from '@/components/settings/DataOverviewCard'
import { CurrencyPickerSheet } from '@/components/settings/CurrencyPickerSheet'
import { useSettings } from '@/hooks/useSettings'
import { useToast } from '@/hooks/useToast'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { updateSettings } from '@/services/settingsService'
import {
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
} from '@/services/notificationService'
import { clearAllData, downloadExport, exportAllData, importData } from '@/services/exportImportService'
import { seedDemoData } from '@/db/seed'
import { CURRENCY_INFO } from '@/lib/currency'
import { cn } from '@/lib/cn'
import type { ThemeMode, CurrencyCode } from '@/types/models'

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: Smartphone },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

const ROW_CLASS = 'flex w-full items-center gap-3 p-4 text-left transition-colors active:bg-secondary hover:bg-secondary/60'

/** iOS Settings–style colored icon badge, so each row reads at a glance instead of relying on plain gray glyphs. */
function IconBadge({ icon: Icon, className }: { icon: typeof Sun; className?: string }) {
  return (
    <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-white', className)}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  )
}

export default function SettingsPage() {
  const { settings } = useSettings()
  const { success, error, toast } = useToast()
  const { installed, canPromptAndroid, isIosSafari, promptInstall } = useInstallPrompt()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<unknown>(null)
  const [currencySheetOpen, setCurrencySheetOpen] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission)
  const mountedRef = useRef(true)
  useEffect(() => () => {
    mountedRef.current = false
  }, [])

  async function handleExport() {
    const data = await exportAllData()
    downloadExport(data)
    success('Export ready', 'Your backup file has started downloading.')
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const json = JSON.parse(text)
      setPendingImport(json)
    } catch {
      error('Invalid file', 'That file is not valid JSON.')
    }
  }

  async function confirmImport() {
    if (!pendingImport) return
    const result = await importData(pendingImport)
    setPendingImport(null)
    if (result.success) {
      success('Data imported', 'Your backup has been restored.')
    } else {
      error('Import failed', result.errors[0] ?? 'The file is not a valid Spendly backup.')
    }
  }

  async function handleClearAll() {
    const backup = await exportAllData()
    downloadExport(backup)
    await clearAllData()
    setClearConfirmOpen(false)
    success('All data cleared', 'A backup was downloaded first, just in case.')
  }

  async function handleLoadDemoData() {
    await seedDemoData()
    success('Demo data loaded', 'Sample transactions, budgets, and goals have been added.')
  }

  async function handleInstallClick() {
    if (canPromptAndroid) {
      await promptInstall()
    } else if (isIosSafari) {
      toast({ title: 'Install Spendly', description: 'Tap the Share icon, then "Add to Home Screen".' })
    }
  }

  async function handleNotificationsToggle(next: boolean) {
    if (next) {
      const permission = await requestNotificationPermission()
      if (!mountedRef.current) return
      setNotificationPermission(permission)
      if (permission !== 'granted') {
        if (permission === 'denied') {
          toast({
            title: "Notifications blocked",
            description: 'Enable them for Spendly in your browser or phone settings, then try again.',
          })
        }
        return
      }
    }
    await updateSettings({ notificationsEnabled: next })
  }

  function handleSecurityClick() {
    toast({
      title: 'Biometric & PIN lock — coming soon',
      description: "For now, your phone's own screen lock keeps Spendly private.",
    })
  }

  const currency = settings?.currency ?? 'PHP'

  return (
    <div className="flex flex-col gap-6 pb-6 pt-6 safe-top">
      <PageHeader title="Settings" />

      <section className="px-5">
        <Card className="flex items-center gap-3 p-4">
          <Logo />
          <div>
            <p className="font-semibold">Spendly</p>
            <p className="text-xs text-muted-foreground">Know where your money goes.</p>
          </div>
        </Card>
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Data</h2>
        <DataOverviewCard />
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Appearance</h2>
        <Card>
          <div className="grid grid-cols-3 gap-2 p-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => updateSettings({ theme: value })}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-medium transition-all active:scale-95',
                  settings?.theme === value ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary',
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Currency</h2>
        <Card>
          <button type="button" onClick={() => setCurrencySheetOpen(true)} className={cn(ROW_CLASS, 'rounded-2xl')}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-emerald-500 text-sm font-semibold text-white">
              {CURRENCY_INFO[currency].symbol}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium">{CURRENCY_INFO[currency].name}</p>
              <p className="text-xs text-muted-foreground">{currency}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </Card>
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organize</h2>
        <Card className="divide-y divide-border overflow-hidden">
          <SettingsRow to="/settings/categories" icon={Shapes} iconBg="bg-orange-500" label="Categories" />
          <SettingsRow to="/settings/recurring" icon={Repeat} iconBg="bg-violet-500" label="Recurring Transactions" />
        </Card>
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data</h2>
        <Card className="divide-y divide-border overflow-hidden">
          <button type="button" onClick={handleExport} className={ROW_CLASS}>
            <IconBadge icon={Download} className="bg-blue-500" />
            <span className="flex-1 text-[15px] font-medium">Export Data</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button type="button" onClick={handleImportClick} className={ROW_CLASS}>
            <IconBadge icon={Upload} className="bg-sky-500" />
            <span className="flex-1 text-[15px] font-medium">Import Data</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileSelected} />
          <button type="button" onClick={handleLoadDemoData} className={ROW_CLASS}>
            <IconBadge icon={Sparkles} className="bg-pink-500" />
            <span className="flex-1 text-[15px] font-medium">Load Demo Data</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </Card>
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-destructive">Danger Zone</h2>
        <Card className="border-destructive/30 bg-destructive/5">
          <button
            type="button"
            onClick={() => setClearConfirmOpen(true)}
            className={cn(ROW_CLASS, 'rounded-2xl text-destructive active:bg-destructive/10 hover:bg-destructive/10')}
          >
            <IconBadge icon={Trash2} className="bg-destructive" />
            <div className="flex-1">
              <p className="text-[15px] font-medium">Clear All Data</p>
              <p className="text-xs text-destructive/70">Permanently erase everything on this device</p>
            </div>
          </button>
        </Card>
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notifications</h2>
        <Card>
          {isNotificationSupported() ? (
            <div className={cn(ROW_CLASS, 'rounded-2xl')}>
              <IconBadge icon={Bell} className="bg-red-500" />
              <div className="flex-1">
                <p className="text-[15px] font-medium">Budget & Recurring Alerts</p>
                <p className="text-xs text-muted-foreground">
                  {notificationPermission === 'denied'
                    ? 'Blocked in browser settings'
                    : 'Local only — nothing leaves your device'}
                </p>
              </div>
              <span
                role="switch"
                aria-checked={!!settings?.notificationsEnabled}
                aria-label="Toggle notifications"
                onClick={() => handleNotificationsToggle(!settings?.notificationsEnabled)}
                className={cn(
                  'flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors',
                  settings?.notificationsEnabled ? 'bg-primary' : 'bg-secondary',
                )}
              >
                <span
                  className={cn(
                    'h-5 w-5 rounded-full bg-card shadow transition-transform',
                    settings?.notificationsEnabled && 'translate-x-4',
                  )}
                />
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <IconBadge icon={Bell} className="bg-red-500" />
              <div className="flex-1">
                <p className="text-[15px] font-medium">Budget & Recurring Alerts</p>
                <p className="text-xs text-muted-foreground">Not supported in this browser</p>
              </div>
            </div>
          )}
        </Card>
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Security</h2>
        <Card>
          <button type="button" onClick={handleSecurityClick} className={cn(ROW_CLASS, 'rounded-2xl')}>
            <IconBadge icon={Fingerprint} className="bg-zinc-700" />
            <div className="flex-1">
              <p className="text-[15px] font-medium">Biometric &amp; PIN Lock</p>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
          </button>
        </Card>
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">About</h2>
        <Card className="divide-y divide-border overflow-hidden">
          {installed ? (
            <div className="flex items-center gap-3 p-4">
              <IconBadge icon={CheckCircle2} className="bg-success" />
              <span className="flex-1 text-[15px] font-medium">Spendly is installed</span>
            </div>
          ) : canPromptAndroid || isIosSafari ? (
            <button type="button" onClick={handleInstallClick} className={ROW_CLASS}>
              <IconBadge icon={Download} className="bg-blue-500" />
              <span className="flex-1 text-[15px] font-medium">Install App</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <IconBadge icon={Download} className="bg-blue-500" />
              <div className="flex-1">
                <p className="text-[15px] font-medium">Install App</p>
                <p className="text-xs text-muted-foreground">Available in Chrome, Edge, or Safari on iPhone</p>
              </div>
            </div>
          )}
          <SettingsRow to="/welcome" icon={Sparkles} iconBg="bg-indigo-500" label="Welcome Screen" />
        </Card>
      </section>

      <p className="px-5 text-center text-xs text-muted-foreground">
        All data stays on this device. Spendly sends nothing to the internet.
      </p>

      <CurrencyPickerSheet
        open={currencySheetOpen}
        onClose={() => setCurrencySheetOpen(false)}
        value={currency}
        onSelect={(c: CurrencyCode) => updateSettings({ currency: c })}
      />

      <ConfirmDialog
        open={clearConfirmOpen}
        title="Delete all Spendly data?"
        description="A backup file will download automatically before anything is deleted, so you can re-import it later if needed."
        confirmLabel="Delete Everything"
        destructive
        onConfirm={handleClearAll}
        onCancel={() => setClearConfirmOpen(false)}
      />

      <ConfirmDialog
        open={pendingImport !== null}
        title="Replace all data?"
        description="Importing will overwrite your current transactions, budgets, goals, and categories with the contents of this file."
        confirmLabel="Import & Replace"
        destructive
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />
    </div>
  )
}

function SettingsRow({
  to,
  icon,
  iconBg,
  label,
}: {
  to: string
  icon: typeof Shapes
  iconBg: string
  label: string
}) {
  return (
    <Link to={to} className={ROW_CLASS}>
      <IconBadge icon={icon} className={iconBg} />
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  )
}
