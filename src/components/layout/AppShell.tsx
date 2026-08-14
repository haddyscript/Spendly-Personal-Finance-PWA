import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { OfflineBanner } from '@/components/pwa/OfflineBanner'
import { TransactionFormSheet } from '@/components/transactions/TransactionFormSheet'

export interface AppShellContext {
  openAddTransaction: () => void
}

export function AppShell() {
  const [addOpen, setAddOpen] = useState(false)
  const context: AppShellContext = { openAddTransaction: () => setAddOpen(true) }

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col bg-background">
      <OfflineBanner />
      <main className="flex-1 pb-28">
        <Outlet context={context} />
      </main>
      <BottomNav onAddClick={() => setAddOpen(true)} />
      <TransactionFormSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
