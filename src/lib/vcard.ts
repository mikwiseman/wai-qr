// vCard 3.0 generation for business cards

export interface VCardData {
  displayName: string
  email?: string | null
  phone?: string | null
  website?: string | null
  company?: string | null
  jobTitle?: string | null
  location?: string | null
  bio?: string | null
  avatarUrl?: string | null
  socialLinks?: Array<{
    platform: string
    url: string
  }>
  cardUrl?: string
}

/**
 * Escape special characters for vCard format
 */
function escapeVCard(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Fold long lines according to vCard spec (max 75 chars per line)
 */
function foldLine(line: string): string {
  const maxLength = 75
  if (line.length <= maxLength) return line

  const lines: string[] = []
  let remaining = line

  // First line can be full length
  lines.push(remaining.slice(0, maxLength))
  remaining = remaining.slice(maxLength)

  // Continuation lines start with a space
  while (remaining.length > 0) {
    lines.push(' ' + remaining.slice(0, maxLength - 1))
    remaining = remaining.slice(maxLength - 1)
  }

  return lines.join('\r\n')
}

/**
 * Map social platform to vCard X-SOCIALPROFILE type
 */
function getSocialProfileType(platform: string): string {
  const typeMap: Record<string, string> = {
    linkedin: 'linkedin',
    twitter: 'twitter',
    facebook: 'facebook',
    instagram: 'instagram',
    github: 'github',
    youtube: 'youtube',
    tiktok: 'tiktok',
    telegram: 'telegram',
    whatsapp: 'whatsapp',
    discord: 'discord',
  }
  return typeMap[platform.toLowerCase()] || platform.toLowerCase()
}

/**
 * Generate vCard 3.0 format string
 */
export function generateVCard(data: VCardData): string {
  const lines: string[] = []

  // Required fields
  lines.push('BEGIN:VCARD')
  lines.push('VERSION:3.0')
  lines.push(`FN:${escapeVCard(data.displayName)}`)

  // Split name into components (simple approach: first/last)
  const nameParts = data.displayName.trim().split(/\s+/)
  const lastName = nameParts.length > 1 ? nameParts.pop() : ''
  const firstName = nameParts.join(' ')
  lines.push(`N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`)

  // Organization and title
  if (data.company || data.jobTitle) {
    if (data.company) {
      lines.push(`ORG:${escapeVCard(data.company)}`)
    }
    if (data.jobTitle) {
      lines.push(`TITLE:${escapeVCard(data.jobTitle)}`)
    }
  }

  // Contact info
  if (data.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(data.email)}`)
  }

  if (data.phone) {
    // Clean phone number
    const cleanPhone = data.phone.replace(/[^\d+\-\s()]/g, '')
    lines.push(`TEL;TYPE=CELL:${escapeVCard(cleanPhone)}`)
  }

  // Website
  if (data.website) {
    lines.push(`URL:${escapeVCard(data.website)}`)
  }

  // Location (as address label)
  if (data.location) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(data.location)};;;;`)
  }

  // Bio as note
  if (data.bio) {
    lines.push(`NOTE:${escapeVCard(data.bio)}`)
  }

  // Avatar photo (URL reference)
  if (data.avatarUrl) {
    // Use VALUE=URI for external photos
    lines.push(`PHOTO;VALUE=URI:${escapeVCard(data.avatarUrl)}`)
  }

  // Social profiles (using X-SOCIALPROFILE extension)
  if (data.socialLinks && data.socialLinks.length > 0) {
    for (const link of data.socialLinks) {
      const type = getSocialProfileType(link.platform)
      lines.push(`X-SOCIALPROFILE;TYPE=${type}:${escapeVCard(link.url)}`)
    }
  }

  // Card URL
  if (data.cardUrl) {
    lines.push(`X-DIGITALCARD:${escapeVCard(data.cardUrl)}`)
  }

  // Timestamp
  const now = new Date()
  const rev = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  lines.push(`REV:${rev}`)

  // Product ID
  lines.push('PRODID:-//WaiQR//Digital Business Card//EN')

  lines.push('END:VCARD')

  // Fold lines and join with CRLF
  return lines.map(foldLine).join('\r\n')
}

/**
 * Generate filename for vCard download
 */
export function generateVCardFilename(displayName: string): string {
  // Convert to lowercase, replace spaces with underscores, remove special chars
  const safeName = displayName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 50)

  return `${safeName || 'contact'}.vcf`
}

/**
 * Get MIME type for vCard
 */
export function getVCardMimeType(): string {
  return 'text/vcard'
}
