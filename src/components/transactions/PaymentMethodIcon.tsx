import { MoreHorizontal } from 'lucide-react'
import { PAYMENT_METHOD_LOGOS } from '@/lib/paymentMethods'
import { cn } from '@/lib/cn'
import type { PaymentMethod } from '@/types/models'

export interface PaymentMethodIconProps {
  method: PaymentMethod
  size?: number
  className?: string
}

export function PaymentMethodIcon({ method, size = 18, className }: PaymentMethodIconProps) {
  const logo = PAYMENT_METHOD_LOGOS[method]

  if (logo) {
    return (
      <img
        src={logo}
        alt=""
        width={size}
        height={size}
        className={cn('shrink-0 rounded-full object-cover', className)}
      />
    )
  }

  return (
    <MoreHorizontal
      className={cn('shrink-0', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  )
}
