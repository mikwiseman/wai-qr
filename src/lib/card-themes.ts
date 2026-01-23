// Theme definitions for business cards

export interface CardTheme {
  id: string
  name: string
  description: string
  // Background
  bgClass: string
  bgGradient?: string
  // Text
  textPrimaryClass: string
  textSecondaryClass: string
  // Card/container
  cardBgClass: string
  cardBorderClass: string
  cardShadowClass: string
  // Links
  linkBgClass: string
  linkHoverClass: string
  linkTextClass: string
  // Social icons
  socialBgClass: string
  socialHoverClass: string
  // Button (vCard download, etc.)
  buttonBgClass: string
  buttonHoverClass: string
  buttonTextClass: string
}

export const cardThemes: CardTheme[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and professional with subtle shadows',
    bgClass: 'bg-gray-50',
    textPrimaryClass: 'text-gray-900',
    textSecondaryClass: 'text-gray-700',
    cardBgClass: 'bg-white',
    cardBorderClass: 'border-gray-200',
    cardShadowClass: 'shadow-xl',
    linkBgClass: 'bg-gray-100',
    linkHoverClass: 'hover:bg-gray-200',
    linkTextClass: 'text-gray-900',
    socialBgClass: 'bg-gray-100',
    socialHoverClass: 'hover:bg-gray-200',
    buttonBgClass: 'bg-violet-600',
    buttonHoverClass: 'hover:bg-violet-700',
    buttonTextClass: 'text-white',
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Sleek dark mode design',
    bgClass: 'bg-gray-900',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-gray-400',
    cardBgClass: 'bg-gray-800',
    cardBorderClass: 'border-gray-700',
    cardShadowClass: 'shadow-2xl',
    linkBgClass: 'bg-gray-700',
    linkHoverClass: 'hover:bg-gray-600',
    linkTextClass: 'text-white',
    socialBgClass: 'bg-gray-700',
    socialHoverClass: 'hover:bg-gray-600',
    buttonBgClass: 'bg-violet-500',
    buttonHoverClass: 'hover:bg-violet-400',
    buttonTextClass: 'text-white',
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Vibrant gradient background',
    bgClass: 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-violet-100',
    cardBgClass: 'bg-white/10 backdrop-blur-lg',
    cardBorderClass: 'border-white/20',
    cardShadowClass: 'shadow-2xl',
    linkBgClass: 'bg-white/20',
    linkHoverClass: 'hover:bg-white/30',
    linkTextClass: 'text-white',
    socialBgClass: 'bg-white/20',
    socialHoverClass: 'hover:bg-white/30',
    buttonBgClass: 'bg-white',
    buttonHoverClass: 'hover:bg-gray-100',
    buttonTextClass: 'text-violet-600',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean with lots of whitespace',
    bgClass: 'bg-white',
    textPrimaryClass: 'text-gray-900',
    textSecondaryClass: 'text-gray-700',
    cardBgClass: 'bg-white',
    cardBorderClass: 'border-transparent',
    cardShadowClass: 'shadow-none',
    linkBgClass: 'bg-transparent border border-gray-200',
    linkHoverClass: 'hover:border-gray-400',
    linkTextClass: 'text-gray-900',
    socialBgClass: 'bg-transparent',
    socialHoverClass: 'hover:bg-gray-100',
    buttonBgClass: 'bg-gray-900',
    buttonHoverClass: 'hover:bg-gray-800',
    buttonTextClass: 'text-white',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calm blue tones',
    bgClass: 'bg-gradient-to-b from-slate-100 to-blue-100',
    textPrimaryClass: 'text-slate-900',
    textSecondaryClass: 'text-slate-600',
    cardBgClass: 'bg-white/95 backdrop-blur-sm',
    cardBorderClass: 'border-blue-200',
    cardShadowClass: 'shadow-xl',
    linkBgClass: 'bg-blue-50',
    linkHoverClass: 'hover:bg-blue-100',
    linkTextClass: 'text-slate-800',
    socialBgClass: 'bg-blue-100',
    socialHoverClass: 'hover:bg-blue-200',
    buttonBgClass: 'bg-blue-600',
    buttonHoverClass: 'hover:bg-blue-700',
    buttonTextClass: 'text-white',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm amber tones',
    bgClass: 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50',
    textPrimaryClass: 'text-stone-900',
    textSecondaryClass: 'text-stone-600',
    cardBgClass: 'bg-white/95 backdrop-blur-sm',
    cardBorderClass: 'border-orange-200',
    cardShadowClass: 'shadow-xl',
    linkBgClass: 'bg-orange-50',
    linkHoverClass: 'hover:bg-orange-100',
    linkTextClass: 'text-stone-800',
    socialBgClass: 'bg-orange-100',
    socialHoverClass: 'hover:bg-orange-200',
    buttonBgClass: 'bg-orange-600',
    buttonHoverClass: 'hover:bg-orange-700',
    buttonTextClass: 'text-white',
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Soft green tones',
    bgClass: 'bg-gradient-to-b from-stone-50 to-green-50',
    textPrimaryClass: 'text-stone-900',
    textSecondaryClass: 'text-stone-600',
    cardBgClass: 'bg-white/95 backdrop-blur-sm',
    cardBorderClass: 'border-green-200',
    cardShadowClass: 'shadow-xl',
    linkBgClass: 'bg-green-50',
    linkHoverClass: 'hover:bg-green-100',
    linkTextClass: 'text-stone-800',
    socialBgClass: 'bg-green-100',
    socialHoverClass: 'hover:bg-green-200',
    buttonBgClass: 'bg-green-700',
    buttonHoverClass: 'hover:bg-green-800',
    buttonTextClass: 'text-white',
  },
]

/**
 * Get a theme by ID
 */
export function getThemeById(id: string): CardTheme | undefined {
  return cardThemes.find(t => t.id === id)
}

/**
 * Get default theme
 */
export function getDefaultTheme(): CardTheme {
  return cardThemes[0]
}

/**
 * Predefined accent colors
 */
export const accentColors = [
  { id: 'violet', name: 'Violet', value: '#8B5CF6' },
  { id: 'blue', name: 'Blue', value: '#3B82F6' },
  { id: 'cyan', name: 'Cyan', value: '#06B6D4' },
  { id: 'green', name: 'Green', value: '#22C55E' },
  { id: 'yellow', name: 'Yellow', value: '#EAB308' },
  { id: 'orange', name: 'Orange', value: '#F97316' },
  { id: 'red', name: 'Red', value: '#EF4444' },
  { id: 'pink', name: 'Pink', value: '#EC4899' },
  { id: 'gray', name: 'Gray', value: '#6B7280' },
  { id: 'black', name: 'Black', value: '#000000' },
]

/**
 * Get accent color by value
 */
export function getAccentColor(value: string) {
  return accentColors.find(c => c.value === value)
}
