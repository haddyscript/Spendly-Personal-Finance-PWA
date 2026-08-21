import billsIcon from '@/assets/icons/choose-category/Bills-icon.png'
import educationIcon from '@/assets/icons/choose-category/education-icon.png'
import entertainmentIcon from '@/assets/icons/choose-category/entertainment-icon.png'
import familyIcon from '@/assets/icons/choose-category/family-icon.png'

/** Custom illustrated icons for specific categories, keyed by the category's lucide icon name (Category.icon). Categories not listed here fall back to their lucide icon — see CategoryIcon. */
export const CATEGORY_ICON_IMAGES: Partial<Record<string, string>> = {
  Receipt: billsIcon,
  GraduationCap: educationIcon,
  Film: entertainmentIcon,
  Users: familyIcon,
}
