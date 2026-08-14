import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import {
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
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Logo } from '@/components/layout/Logo'
import { useSettings } from '@/hooks/useSettings'
import { useToast } from '@/hooks/useToast'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { updateSettings } from '@/services/settingsService'
import { clearAllData, downloadExport, exportAllData, importData } from '@/services/exportImportService'
import { seedDemoData } from '@/db/seed'
import { CURRENCIES } from '@/types/models'
import type { ThemeMode, CurrencyCode } from '@/types/models'

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: Smartphone },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

export default function SettingsPage() {
  const { settings } = useSettings()
  const { success, error, toast } = useToast()
  const { installed, canPromptAndroid, isIosSafari, promptInstall } = useInstallPrompt()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<unknown>(null)

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

  return (
    <div className="flex flex-col gap-6 pb-6 pt-6 safe-top">
      <PageHeader title="Settings" />

      <div className="flex items-center gap-3 px-5">
        <Logo />
        <div>
          <p className="font-semibold">Spendly</p>
          <p className="text-xs text-muted-foreground">Know where your money goes.</p>
        </div>
      </div>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Appearance</h2>
        <Card>
          <div className="grid grid-cols-3 gap-2 p-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => updateSettings({ theme: value })}
                className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-medium transition-colors ${
                  settings?.theme === value ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary'
                }`}
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
        <Card className="p-3">
          <Select
            aria-label="Currency"
            value={settings?.currency ?? 'PHP'}
            onChange={(e) => updateSettings({ currency: e.target.value as CurrencyCode })}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Card>
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organize</h2>
        <Card className="divide-y divide-border">
          <SettingsRow to="/settings/categories" icon={Shapes} label="Categories" />
          <SettingsRow to="/settings/recurring" icon={Repeat} label="Recurring Transactions" />
        </Card>
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data</h2>
        <Card className="divide-y divide-border">
          <button type="button" onClick={handleExport} className="flex w-full items-center gap-3 p-4 text-left">
            <Download className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-[15px] font-medium">Export Data</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button type="button" onClick={handleImportClick} className="flex w-full items-center gap-3 p-4 text-left">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-[15px] font-medium">Import Data</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileSelected} />
          <button type="button" onClick={handleLoadDemoData} className="flex w-full items-center gap-3 p-4 text-left">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-[15px] font-medium">Load Demo Data</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => setClearConfirmOpen(true)}
            className="flex w-full items-center gap-3 p-4 text-left text-destructive"
          >
            <Trash2 className="h-5 w-5" />
            <span className="flex-1 text-[15px] font-medium">Clear All Data</span>
          </button>
        </Card>
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Security</h2>
        <Card className="flex items-center gap-3 p-4">
          <Fingerprint className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-[15px] font-medium">Biometric &amp; PIN Lock</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </Card>
      </section>

      <section className="px-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">About</h2>
        <Card className="divide-y divide-border">
          {installed ? (
            <div className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="flex-1 text-[15px] font-medium">Spendly is installed</span>
            </div>
          ) : canPromptAndroid || isIosSafari ? (
            <button type="button" onClick={handleInstallClick} className="flex w-full items-center gap-3 p-4 text-left">
              <Download className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-[15px] font-medium">Install App</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <Download className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-[15px] font-medium">Install App</p>
                <p className="text-xs text-muted-foreground">Available in Chrome, Edge, or Safari on iPhone</p>
              </div>
            </div>
          )}
          <SettingsRow to="/welcome" icon={Sparkles} label="Welcome Screen" />
        </Card>
      </section>

      <p className="px-5 text-center text-xs text-muted-foreground">
        All data stays on this device. Spendly sends nothing to the internet.
      </p>

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

function SettingsRow({ to, icon: Icon, label }: { to: string; icon: typeof Shapes; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-4">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  )
}
