import { createElement } from 'react'
import { getIcon } from '@/lib/icons'
import { cn } from '@/lib/cn'
import { CATEGORY_ICON_IMAGES } from '@/lib/categoryIcons'

export interface CategoryIconProps {
  icon: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: { wrapper: 'h-9 w-9', icon: 'h-4 w-4' },
  md: { wrapper: 'h-11 w-11', icon: 'h-5 w-5' },
  lg: { wrapper: 'h-14 w-14', icon: 'h-6 w-6' },
}

export function CategoryIcon({ icon, color, size = 'md', className }: CategoryIconProps) {
  const dims = SIZES[size]
  const image = CATEGORY_ICON_IMAGES[icon]

  if (image) {
    return (
      <img src={image} alt="" className={cn('shrink-0 rounded-full object-cover', dims.wrapper, className)} />
    )
  }

  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full', dims.wrapper, className)}
      style={{ backgroundColor: `${color}22`, color }}
      aria-hidden="true"
    >
      {createElement(getIcon(icon), { className: dims.icon })}
    </div>
  )
}
