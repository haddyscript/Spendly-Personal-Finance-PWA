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
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-violet-500/20 blur-[90px]" />
        <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-orange-500/15 blur-[100px]" />
        <div className="absolute bottom-10 left-1/4 h-56 w-56 rounded-full bg-blue-500/10 blur-[90px]" />
      </div>
      <OfflineBanner />
      <main className="flex-1 pb-28">
        <Outlet context={context} />
      </main>
      <BottomNav onAddClick={() => setAddOpen(true)} />
      <TransactionFormSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
