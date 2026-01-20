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
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    urlPattern: 'https://linkedin.com/in/{username}',
    usernameRegex: /linkedin\.com\/in\/([^\/\?]+)/i,
    placeholder: 'linkedin.com/in/username',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: '𝕏',
    color: '#000000',
    urlPattern: 'https://x.com/{username}',
    usernameRegex: /(?:twitter|x)\.com\/([^\/\?]+)/i,
    placeholder: 'x.com/username',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    color: '#26A5E4',
    urlPattern: 'https://t.me/{username}',
    usernameRegex: /t\.me\/([^\/\?]+)/i,
    placeholder: 't.me/username',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    urlPattern: 'https://instagram.com/{username}',
    usernameRegex: /instagram\.com\/([^\/\?]+)/i,
    placeholder: 'instagram.com/username',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    color: '#181717',
    urlPattern: 'https://github.com/{username}',
    usernameRegex: /github\.com\/([^\/\?]+)/i,
    placeholder: 'github.com/username',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    urlPattern: 'https://youtube.com/@{username}',
    usernameRegex: /youtube\.com\/(?:@|c\/|channel\/)?([^\/\?]+)/i,
    placeholder: 'youtube.com/@username',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    urlPattern: 'https://tiktok.com/@{username}',
    usernameRegex: /tiktok\.com\/@?([^\/\?]+)/i,
    placeholder: 'tiktok.com/@username',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    urlPattern: 'https://wa.me/{username}',
    usernameRegex: /wa\.me\/([^\/\?]+)/i,
    placeholder: 'Phone number (e.g., 1234567890)',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👤',
    color: '#1877F2',
    urlPattern: 'https://facebook.com/{username}',
    usernameRegex: /facebook\.com\/([^\/\?]+)/i,
    placeholder: 'facebook.com/username',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    color: '#5865F2',
    urlPattern: 'https://discord.gg/{username}',
    usernameRegex: /discord\.(?:gg|com\/invite)\/([^\/\?]+)/i,
    placeholder: 'discord.gg/invite-code',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: '🎥',
    color: '#9146FF',
    urlPattern: 'https://twitch.tv/{username}',
    usernameRegex: /twitch\.tv\/([^\/\?]+)/i,
    placeholder: 'twitch.tv/username',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '🎧',
    color: '#1DB954',
    urlPattern: 'https://open.spotify.com/user/{username}',
    usernameRegex: /spotify\.com\/(?:user|artist)\/([^\/\?]+)/i,
    placeholder: 'Spotify profile URL',
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    icon: '🏀',
    color: '#EA4C89',
    urlPattern: 'https://dribbble.com/{username}',
    usernameRegex: /dribbble\.com\/([^\/\?]+)/i,
    placeholder: 'dribbble.com/username',
  },
  {
    id: 'behance',
    name: 'Behance',
    icon: '🎨',
    color: '#1769FF',
    urlPattern: 'https://behance.net/{username}',
    usernameRegex: /behance\.net\/([^\/\?]+)/i,
    placeholder: 'behance.net/username',
  },
  {
    id: 'medium',
    name: 'Medium',
    icon: '📝',
    color: '#000000',
    urlPattern: 'https://medium.com/@{username}',
    usernameRegex: /medium\.com\/@?([^\/\?]+)/i,
    placeholder: 'medium.com/@username',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    color: '#BD081C',
    urlPattern: 'https://pinterest.com/{username}',
    usernameRegex: /pinterest\.com\/([^\/\?]+)/i,
    placeholder: 'pinterest.com/username',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: '👻',
    color: '#FFFC00',
    urlPattern: 'https://snapchat.com/add/{username}',
    usernameRegex: /snapchat\.com\/add\/([^\/\?]+)/i,
    placeholder: 'snapchat.com/add/username',
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: '🧵',
    color: '#000000',
    urlPattern: 'https://threads.net/@{username}',
    usernameRegex: /threads\.net\/@?([^\/\?]+)/i,
    placeholder: 'threads.net/@username',
  },
  {
    id: 'email',
    name: 'Email',
    icon: '✉️',
    color: '#EA4335',
    urlPattern: 'mailto:{username}',
    placeholder: 'email@example.com',
  },
  {
    id: 'phone',
    name: 'Phone',
    icon: '📞',
    color: '#34A853',
    urlPattern: 'tel:{username}',
    placeholder: '+1 234 567 8900',
  },
  {
    id: 'website',
    name: 'Website',
    icon: '🌐',
    color: '#4285F4',
    urlPattern: '{username}',
    placeholder: 'https://yourwebsite.com',
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

  // Handle special cases
  if (platform.id === 'email' && !username.includes('@')) {
    return `mailto:${username}`
  }
  if (platform.id === 'phone') {
    return `tel:${username.replace(/\s/g, '')}`
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
