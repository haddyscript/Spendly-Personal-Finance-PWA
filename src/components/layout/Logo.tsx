import logoIcon from '@/assets/logo-icon.png'
import { cn } from '@/lib/cn'

export function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-14 w-14' : 'h-10 w-10'
  return (
    <img
      src={logoIcon}
      alt="Spendly"
      className={cn('shrink-0 rounded-2xl', dims, className)}
    />
  )
}
