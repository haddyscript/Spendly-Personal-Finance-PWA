import billsIcon from '@/assets/icons/choose-category/Bills-icon.png'
import educationIcon from '@/assets/icons/choose-category/education-icon.png'
import entertainmentIcon from '@/assets/icons/choose-category/entertainment-icon.png'
import familyIcon from '@/assets/icons/choose-category/family-icon.png'
import foodIcon from '@/assets/icons/choose-category/food-icon.png'
import gymIcon from '@/assets/icons/choose-category/gym-icon.png'
import healthIcon from '@/assets/icons/choose-category/health-icon.png'
import motorcycleIcon from '@/assets/icons/choose-category/motorcycle-icon.png'
import otherIcon from '@/assets/icons/choose-category/other-icon.png'
import shoppingIcon from '@/assets/icons/choose-category/shopping-icon.png'
import subscriptionIcon from '@/assets/icons/choose-category/subscription-icon.png'
import transportationIcon from '@/assets/icons/choose-category/transportation-icon.png'
import travelIcon from '@/assets/icons/choose-category/travel-icon.png'

/** Custom illustrated icons for specific categories, keyed by the category's lucide icon name (Category.icon). Categories not listed here fall back to their lucide icon — see CategoryIcon. */
export const CATEGORY_ICON_IMAGES: Partial<Record<string, string>> = {
  Receipt: billsIcon,
  GraduationCap: educationIcon,
  Film: entertainmentIcon,
  Users: familyIcon,
  Utensils: foodIcon,
  Dumbbell: gymIcon,
  HeartPulse: healthIcon,
  Motorbike: motorcycleIcon,
  MoreHorizontal: otherIcon,
  ShoppingBag: shoppingIcon,
  Repeat: subscriptionIcon,
  Car: transportationIcon,
  Plane: travelIcon,
}
