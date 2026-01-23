// Social platform definitions for business cards

export interface SocialPlatform {
  id: string
  name: string
  icon: string  // Emoji or icon name
  color: string
  urlPattern: string  // Pattern with {username} placeholder
  usernameRegex?: RegExp  // To extract username from URL
  placeholder: string  // Input placeholder
}

export const socialPlatforms: SocialPlatform[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'telegram',
    color: '#26A5E4',
    urlPattern: 'https://t.me/{username}',
    usernameRegex: /t\.me\/([^\/\?]+)/i,
    placeholder: 't.me/username',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0A66C2',
    urlPattern: 'https://linkedin.com/in/{username}',
    usernameRegex: /linkedin\.com\/in\/([^\/\?]+)/i,
    placeholder: 'linkedin.com/in/username',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    urlPattern: 'https://facebook.com/{username}',
    usernameRegex: /facebook\.com\/([^\/\?]+)/i,
    placeholder: 'facebook.com/username',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    urlPattern: 'https://instagram.com/{username}',
    usernameRegex: /instagram\.com\/([^\/\?]+)/i,
    placeholder: 'instagram.com/username',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    color: '#181717',
    urlPattern: 'https://github.com/{username}',
    usernameRegex: /github\.com\/([^\/\?]+)/i,
    placeholder: 'github.com/username',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'discord',
    color: '#5865F2',
    urlPattern: 'https://discord.gg/{username}',
    usernameRegex: /discord\.(?:gg|com\/invite)\/([^\/\?]+)/i,
    placeholder: 'discord.gg/invite-code',
  },
  {
    id: 'behance',
    name: 'Behance',
    icon: 'behance',
    color: '#1769FF',
    urlPattern: 'https://behance.net/{username}',
    usernameRegex: /behance\.net\/([^\/\?]+)/i,
    placeholder: 'behance.net/username',
  },
  {
    id: 'medium',
    name: 'Medium',
    icon: 'medium',
    color: '#000000',
    urlPattern: 'https://medium.com/@{username}',
    usernameRegex: /medium\.com\/@?([^\/\?]+)/i,
    placeholder: 'medium.com/@username',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: 'pinterest',
    color: '#BD081C',
    urlPattern: 'https://pinterest.com/{username}',
    usernameRegex: /pinterest\.com\/([^\/\?]+)/i,
    placeholder: 'pinterest.com/username',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: 'snapchat',
    color: '#FFFC00',
    urlPattern: 'https://snapchat.com/add/{username}',
    usernameRegex: /snapchat\.com\/add\/([^\/\?]+)/i,
    placeholder: 'snapchat.com/add/username',
  },
]

/**
 * Get a social platform by ID
 */
export function getPlatformById(id: string): SocialPlatform | undefined {
  return socialPlatforms.find(p => p.id === id)
}

/**
 * Extract username from a social URL
 */
export function extractUsername(platform: SocialPlatform, url: string): string | null {
  if (!platform.usernameRegex) return null
  const match = url.match(platform.usernameRegex)
  return match ? match[1] : null
}

/**
 * Build a full URL from platform and username
 */
export function buildSocialUrl(platform: SocialPlatform, username: string): string {
  // If it's already a full URL, return as-is
  if (username.startsWith('http://') || username.startsWith('https://')) {
    return username
  }

  // Clean username (remove @ prefix if present)
  const cleanUsername = username.replace(/^@/, '')
  return platform.urlPattern.replace('{username}', cleanUsername)
}

/**
 * Detect platform from URL
 */
export function detectPlatformFromUrl(url: string): SocialPlatform | undefined {
  for (const platform of socialPlatforms) {
    if (platform.usernameRegex && platform.usernameRegex.test(url)) {
      return platform
    }
  }
  return undefined
}

/**
 * Calendar platforms supported for integration
 */
export interface CalendarPlatform {
  id: string
  name: string
  pattern: RegExp
  embedSupport: boolean
}

export const calendarPlatforms: CalendarPlatform[] = [
  {
    id: 'calendly',
    name: 'Calendly',
    pattern: /calendly\.com/i,
    embedSupport: true,
  },
  {
    id: 'cal',
    name: 'Cal.com',
    pattern: /cal\.com/i,
    embedSupport: true,
  },
  {
    id: 'savvycal',
    name: 'SavvyCal',
    pattern: /savvycal\.com/i,
    embedSupport: true,
  },
  {
    id: 'acuity',
    name: 'Acuity Scheduling',
    pattern: /acuityscheduling\.com/i,
    embedSupport: true,
  },
  {
    id: 'youcanbookme',
    name: 'YouCanBookMe',
    pattern: /youcanbook\.me/i,
    embedSupport: true,
  },
]

/**
 * Detect calendar platform from URL
 */
export function detectCalendarPlatform(url: string): CalendarPlatform | undefined {
  for (const platform of calendarPlatforms) {
    if (platform.pattern.test(url)) {
      return platform
    }
  }
  return undefined
}
