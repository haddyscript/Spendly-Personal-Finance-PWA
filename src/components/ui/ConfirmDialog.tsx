import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} labelledBy="confirm-dialog-title">
      <h2 id="confirm-dialog-title" className="text-lg font-semibold">
        {title}
      </h2>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? 'destructive' : 'primary'} className="flex-1" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
