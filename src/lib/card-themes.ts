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
    description: 'Cool blue tones',
    bgClass: 'bg-gradient-to-b from-cyan-400 to-blue-600',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-cyan-100',
    cardBgClass: 'bg-white/10 backdrop-blur-lg',
    cardBorderClass: 'border-white/20',
    cardShadowClass: 'shadow-2xl',
    linkBgClass: 'bg-white/20',
    linkHoverClass: 'hover:bg-white/30',
    linkTextClass: 'text-white',
    socialBgClass: 'bg-white/20',
    socialHoverClass: 'hover:bg-white/30',
    buttonBgClass: 'bg-white',
    buttonHoverClass: 'hover:bg-cyan-50',
    buttonTextClass: 'text-blue-600',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and pink tones',
    bgClass: 'bg-gradient-to-br from-orange-400 via-rose-500 to-pink-600',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-orange-100',
    cardBgClass: 'bg-white/10 backdrop-blur-lg',
    cardBorderClass: 'border-white/20',
    cardShadowClass: 'shadow-2xl',
    linkBgClass: 'bg-white/20',
    linkHoverClass: 'hover:bg-white/30',
    linkTextClass: 'text-white',
    socialBgClass: 'bg-white/20',
    socialHoverClass: 'hover:bg-white/30',
    buttonBgClass: 'bg-white',
    buttonHoverClass: 'hover:bg-orange-50',
    buttonTextClass: 'text-rose-600',
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Fresh green tones',
    bgClass: 'bg-gradient-to-b from-green-400 to-emerald-600',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-green-100',
    cardBgClass: 'bg-white/10 backdrop-blur-lg',
    cardBorderClass: 'border-white/20',
    cardShadowClass: 'shadow-2xl',
    linkBgClass: 'bg-white/20',
    linkHoverClass: 'hover:bg-white/30',
    linkTextClass: 'text-white',
    socialBgClass: 'bg-white/20',
    socialHoverClass: 'hover:bg-white/30',
    buttonBgClass: 'bg-white',
    buttonHoverClass: 'hover:bg-green-50',
    buttonTextClass: 'text-emerald-600',
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
