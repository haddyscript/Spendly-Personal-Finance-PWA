import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { haptic } from '@/lib/haptics'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-colors active:scale-[0.97] transition-transform disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:opacity-90',
        secondary: 'bg-secondary text-secondary-foreground hover:opacity-80',
        outline: 'border border-border bg-transparent hover:bg-secondary',
        ghost: 'bg-transparent hover:bg-secondary',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
      },
      size: {
        default: 'h-12 px-5 text-[15px]',
        sm: 'h-10 px-4 text-sm',
        lg: 'h-14 px-6 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, onClick, ...props }, ref) => {
    function handleClick(e: MouseEvent<HTMLButtonElement>) {
      haptic(variant === 'destructive' ? 'warning' : 'light')
      onClick?.(e)
    }
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        onClick={handleClick}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
