import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { SyncStatusIndicator } from '@/components/pwa/SyncStatusIndicator'
import { TransactionFormSheet } from '@/components/transactions/TransactionFormSheet'
import type { TransactionType } from '@/types/models'

export interface AppShellContext {
  openAddTransaction: (type?: TransactionType) => void
}

export function AppShell() {
  const [addOpen, setAddOpen] = useState(false)
  const [addType, setAddType] = useState<TransactionType>('expense')
  const location = useLocation()
  const context: AppShellContext = {
    openAddTransaction: (type = 'expense') => {
      setAddType(type)
      setAddOpen(true)
    },
  }

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-violet-500/20 blur-[90px]" />
        <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-orange-500/15 blur-[100px]" />
        <div className="absolute bottom-10 left-1/4 h-56 w-56 rounded-full bg-blue-500/10 blur-[90px]" />
      </div>
      <SyncStatusIndicator />
      <main className="flex-1 pb-28">
        {/* Keying on the path remounts this wrapper on every navigation, which restarts the CSS animation. */}
        <div key={location.pathname} className="animate-page-in">
          <Outlet context={context} />
        </div>
      </main>
      <BottomNav onAddClick={() => setAddOpen(true)} />
      <TransactionFormSheet open={addOpen} onClose={() => setAddOpen(false)} defaultType={addType} />
    </div>
  )
}
