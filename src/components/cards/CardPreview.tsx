'use client'

import Image from 'next/image'
import { getThemeById, getDefaultTheme } from '@/lib/card-themes'
import { getPlatformById } from '@/lib/social-platforms'
import { getSocialIconComponent } from '@/components/icons/SocialIcons'

interface SocialLinkPreview {
  platform: string
  url: string
}

interface CustomLinkPreview {
  title: string
  url: string
  icon?: string
}

interface CardPreviewProps {
  displayName: string
  headline: string
  bio: string
  avatarUrl: string
  company: string
  location: string
  email: string
  phone: string
  website: string
  themeStyle: string
  socialLinks: SocialLinkPreview[]
  customLinks: CustomLinkPreview[]
  calendarUrl: string
  showVcardDownload: boolean
}

export default function CardPreview({
  displayName,
  headline,
  bio,
  avatarUrl,
  company,
  location,
  email,
  phone,
  website,
  themeStyle,
  socialLinks,
  customLinks,
  calendarUrl,
  showVcardDownload,
}: CardPreviewProps) {
  const theme = getThemeById(themeStyle) || getDefaultTheme()

  // Get social icon by platform - returns JSX element
  const renderSocialIcon = (platform: string) => {
    const IconComponent = getSocialIconComponent(platform)
    if (IconComponent) {
      return <IconComponent className="w-5 h-5" />
    }
    // Fallback to generic link icon
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    )
  }

  const visibleSocialLinks = socialLinks.filter(l => l.url.trim())
  const visibleCustomLinks = customLinks.filter(l => l.title.trim() && l.url.trim())

  return (
    <div className={`rounded-xl overflow-hidden ${theme.bgClass}`}>
      <div className="max-w-sm mx-auto py-4">
        {/* Cover Image */}
        <div className="relative h-20 bg-gradient-to-r from-violet-500 to-purple-600 mx-4 rounded-t-xl" />

        {/* Main Card */}
        <div className={`relative -mt-10 mx-4 rounded-xl ${theme.cardBgClass} ${theme.cardShadowClass} border ${theme.cardBorderClass} overflow-hidden`}>
          {/* Avatar */}
          <div className="flex justify-center pt-3">
            <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName || 'Avatar'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-2xl ${theme.textSecondaryClass}`}>
                  {displayName ? displayName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-4 pt-3 pb-4 text-center">
            <h1 className={`text-lg font-bold ${theme.textPrimaryClass}`}>
              {displayName || 'Your Name'}
            </h1>
            {headline && (
              <p className={`mt-0.5 text-xs ${theme.textSecondaryClass}`}>
                {headline}
              </p>
            )}
            {company && (
              <p className={`mt-0.5 text-xs ${theme.textSecondaryClass}`}>
                {company}
              </p>
            )}
            {location && (
              <p className={`mt-0.5 text-xs ${theme.textSecondaryClass}`}>
                {location}
              </p>
            )}
            {bio && (
              <p className={`mt-2 text-xs ${theme.textSecondaryClass} whitespace-pre-line line-clamp-3`}>
                {bio}
              </p>
            )}
          </div>

          {/* Contact Info */}
          {(email || phone || website) && (
            <div className="px-4 pb-3 space-y-1.5">
              {email && (
                <div className={`flex items-center gap-2 w-full py-2 px-3 rounded-lg text-xs ${theme.linkBgClass} ${theme.linkTextClass}`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{email}</span>
                </div>
              )}
              {phone && (
                <div className={`flex items-center gap-2 w-full py-2 px-3 rounded-lg text-xs ${theme.linkBgClass} ${theme.linkTextClass}`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{phone}</span>
                </div>
              )}
              {website && (
                <div className={`flex items-center gap-2 w-full py-2 px-3 rounded-lg text-xs ${theme.linkBgClass} ${theme.linkTextClass}`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="truncate">{website.replace(/^https?:\/\//, '')}</span>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {visibleSocialLinks.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex flex-wrap justify-center gap-2">
                {visibleSocialLinks.map((link, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${theme.socialBgClass}`}
                    title={getPlatformById(link.platform)?.name || link.platform}
                  >
                    {renderSocialIcon(link.platform)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Links */}
          {visibleCustomLinks.length > 0 && (
            <div className="px-4 pb-3 space-y-2">
              {visibleCustomLinks.slice(0, 3).map((link, index) => (
                <div
                  key={index}
                  className={`w-full py-2 px-3 rounded-lg text-center text-sm ${theme.linkBgClass} ${theme.linkTextClass}`}
                >
                  {link.icon && <span className="mr-1">{link.icon}</span>}
                  {link.title}
                </div>
              ))}
              {visibleCustomLinks.length > 3 && (
                <p className={`text-xs text-center ${theme.textSecondaryClass}`}>
                  +{visibleCustomLinks.length - 3} more links
                </p>
              )}
            </div>
          )}

          {/* Calendar Link */}
          {calendarUrl && (
            <div className="px-4 pb-3">
              <div className={`w-full py-2 px-3 rounded-lg text-center text-sm ${theme.linkBgClass} ${theme.linkTextClass}`}>
                Book a Meeting
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {showVcardDownload && (
            <div className="px-4 pb-4">
              <div className={`w-full py-2 px-3 rounded-lg text-center text-sm font-medium ${theme.buttonBgClass} ${theme.buttonTextClass}`}>
                Save Contact
              </div>
            </div>
          )}
        </div>

        {/* Powered by */}
        <div className="text-center py-3">
          <span className={`text-xs ${theme.textSecondaryClass}`}>
            Powered by WaiQR
          </span>
        </div>
      </div>
    </div>
  )
}
